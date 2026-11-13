import type { ChatConversation, ChatSender, ChatStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  BOT_ASK_TRACKING,
  botTrackingNotFound,
  extractTrackingNumber,
  formatTrackingReply,
  normalizePhone,
  parseChatSettings,
  serializeChatSettings,
  welcomeMessage,
  type ChatSettings,
} from "@/lib/chat";
import { generateChatToken, hashChatToken } from "@/lib/chat-token";
import type { StartChatInput } from "@/lib/validators/chat";
import { logActivity } from "./activity.service";
import { getPublicTracking } from "./tracking.service";

const messageSelect = {
  id: true,
  seq: true,
  sender: true,
  body: true,
  createdAt: true,
  user: { select: { name: true } },
} satisfies Prisma.ChatMessageSelect;

type MessageRow = Prisma.ChatMessageGetPayload<{ select: typeof messageSelect }>;

export type ChatMessageView = {
  id: string;
  seq: number;
  sender: ChatSender;
  body: string;
  createdAt: string;
  agentName: string | null;
};

function toView(m: MessageRow): ChatMessageView {
  return {
    id: m.id,
    seq: m.seq,
    sender: m.sender,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    agentName: m.user?.name ?? null,
  };
}

// --- Settings ---------------------------------------------------------------

export async function getChatSettings(): Promise<ChatSettings> {
  const rows = await prisma.setting.findMany({ where: { group: "chat" } });
  return parseChatSettings(Object.fromEntries(rows.map((r) => [r.key, r.value])));
}

export async function saveChatSettings(settings: ChatSettings, userId: string) {
  const entries = Object.entries(serializeChatSettings(settings));
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group: "chat" },
      }),
    ),
  );
  await logActivity({ type: "SETTINGS_CHANGED", message: "Chat settings updated", userId });
}

// --- Visitor side -----------------------------------------------------------

export async function findConversationByToken(token: string | undefined) {
  if (!token) return null;
  return prisma.chatConversation.findUnique({ where: { tokenHash: hashChatToken(token) } });
}

/** Creates the room and the bot welcome in one transaction; returns the raw token for the cookie. */
export async function startConversation(input: StartChatInput) {
  const settings = await getChatSettings();
  const token = generateChatToken();
  const trackingNumber = input.trackingNumber ? input.trackingNumber.toUpperCase() : null;

  const conversation = await prisma.chatConversation.create({
    data: {
      tokenHash: hashChatToken(token),
      visitorName: input.name,
      visitorPhone: normalizePhone(input.phone),
      visitorEmail: input.email || null,
      trackingNumber,
      messages: {
        create: { sender: "BOT", body: welcomeMessage(settings, input.name) },
      },
    },
  });

  return { token, conversation };
}

/** Messages after `after`; `markRead` clears the visitor's unread count (widget open). */
export async function getVisitorMessages(conversation: ChatConversation, after: number, markRead: boolean) {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: conversation.id, seq: { gt: after } },
    orderBy: { seq: "asc" },
    select: messageSelect,
  });

  let unread = conversation.unreadForVisitor;
  if (markRead && unread > 0) {
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { unreadForVisitor: 0 },
    });
    unread = 0;
  }

  return { status: conversation.status, unread, messages: messages.map(toView) };
}

async function addMessage(
  conversationId: string,
  sender: ChatSender,
  body: string,
  counters: Prisma.ChatConversationUpdateInput = {},
  userId?: string,
) {
  const [message] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: { conversationId, sender, body, userId },
      select: messageSelect,
    }),
    prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), ...counters },
    }),
  ]);
  return message;
}

async function botTrackingReply(conversationId: string, trackingNumber: string) {
  const shipment = await getPublicTracking(trackingNumber);
  if (!shipment) {
    // The bot promises CS will follow up, so flag the chat for them.
    await addMessage(conversationId, "BOT", botTrackingNotFound(trackingNumber), {
      unreadForAgent: { increment: 1 },
    });
    return;
  }
  const latest = shipment.trackingHistory.at(-1);
  await addMessage(
    conversationId,
    "BOT",
    formatTrackingReply({
      trackingNumber: shipment.trackingNumber,
      statusLabel: shipment.status.label,
      currentLocation: shipment.currentLocation ?? latest?.location ?? null,
      lastUpdate: latest?.timestamp ?? null,
      estimatedDelivery: shipment.estimatedDelivery,
      actualDelivery: shipment.actualDelivery,
    }),
  );
}

/**
 * A visitor message reopens a closed chat. If the bot asked for a tracking number,
 * it answers this one message itself; anything else goes to CS.
 */
export async function sendVisitorMessage(conversation: ChatConversation, body: string) {
  const trackingNumber = conversation.awaitingTracking ? extractTrackingNumber(body) : null;

  // When the bot answers, CS is only pinged if the lookup fails (see botTrackingReply).
  await addMessage(conversation.id, "VISITOR", body, {
    ...(trackingNumber ? {} : { unreadForAgent: { increment: 1 } }),
    status: "OPEN",
    awaitingTracking: false,
  });

  if (trackingNumber) {
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: { trackingNumber: conversation.trackingNumber ?? trackingNumber },
    });
    await botTrackingReply(conversation.id, trackingNumber);
  }
}

export class UnknownQuickReplyError extends Error {
  constructor() {
    super("Pilihan tidak tersedia");
    this.name = "UnknownQuickReplyError";
  }
}

export async function sendQuickReply(conversation: ChatConversation, index: number) {
  const settings = await getChatSettings();
  const reply = settings.quickReplies[index];
  if (!reply) throw new UnknownQuickReplyError();

  if (reply.action === "text") {
    await sendVisitorMessage(conversation, reply.label);
    return;
  }

  // "track": the bot handles it, so CS is not pinged for this message.
  await addMessage(conversation.id, "VISITOR", reply.label, { status: "OPEN" });
  if (conversation.trackingNumber) {
    await botTrackingReply(conversation.id, conversation.trackingNumber);
  } else {
    await addMessage(conversation.id, "BOT", BOT_ASK_TRACKING, { awaitingTracking: true });
  }
}

// --- Agent side -------------------------------------------------------------

export async function listConversations(status: ChatStatus) {
  const conversations = await prisma.chatConversation.findMany({
    where: { status },
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    select: {
      id: true,
      visitorName: true,
      visitorPhone: true,
      trackingNumber: true,
      status: true,
      unreadForAgent: true,
      lastMessageAt: true,
      assignedTo: { select: { name: true } },
      messages: {
        orderBy: { seq: "desc" },
        take: 1,
        select: { body: true, sender: true },
      },
    },
  });

  return conversations.map(({ messages, lastMessageAt, ...c }) => ({
    ...c,
    lastMessageAt: lastMessageAt.toISOString(),
    lastMessage: messages[0] ?? null,
  }));
}

export async function getConversationDetail(id: string) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    select: {
      id: true,
      visitorName: true,
      visitorPhone: true,
      visitorEmail: true,
      trackingNumber: true,
      status: true,
      createdAt: true,
      assignedTo: { select: { id: true, name: true } },
    },
  });
  if (!conversation) return null;

  const previous = await prisma.chatConversation.findMany({
    where: { visitorPhone: conversation.visitorPhone, id: { not: id } },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, createdAt: true, status: true },
  });

  return {
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    previous: previous.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
  };
}

export async function getAgentMessages(id: string, after: number) {
  const messages = await prisma.chatMessage.findMany({
    where: { conversationId: id, seq: { gt: after } },
    orderBy: { seq: "asc" },
    select: messageSelect,
  });
  await prisma.chatConversation.updateMany({
    where: { id, unreadForAgent: { gt: 0 } },
    data: { unreadForAgent: 0 },
  });
  return messages.map(toView);
}

/** Replying assigns an unassigned chat to the replying agent. */
export async function sendAgentMessage(id: string, userId: string, body: string) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    select: { assignedToId: true },
  });
  if (!conversation) return null;

  const message = await addMessage(
    id,
    "AGENT",
    body,
    {
      unreadForVisitor: { increment: 1 },
      unreadForAgent: 0,
      status: "OPEN",
      awaitingTracking: false,
      ...(conversation.assignedToId ? {} : { assignedTo: { connect: { id: userId } } }),
    },
    userId,
  );
  return toView(message);
}

export async function updateConversation(
  id: string,
  userId: string,
  input: { status?: ChatStatus; assignToMe?: boolean },
) {
  const conversation = await prisma.chatConversation.findUnique({ where: { id } });
  if (!conversation) return null;

  if (input.assignToMe) {
    await prisma.chatConversation.update({ where: { id }, data: { assignedToId: userId } });
  }

  if (input.status && input.status !== conversation.status) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    const who = user?.name ?? "CS";
    await addMessage(
      id,
      "SYSTEM",
      input.status === "CLOSED" ? `Chat ditutup oleh ${who}` : `Chat dibuka kembali oleh ${who}`,
      { status: input.status, unreadForAgent: 0 },
    );
  }

  return getConversationDetail(id);
}

export async function getAgentUnreadTotal() {
  const result = await prisma.chatConversation.aggregate({
    where: { status: "OPEN" },
    _sum: { unreadForAgent: true },
  });
  return result._sum.unreadForAgent ?? 0;
}
