import { Role, type ChatConversation, type ChatSender, type ChatStatus, type Prisma } from "@prisma/client";
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
import { hasPermission } from "@/lib/permissions";
import type { StartChatInput, UpdateConversationInput } from "@/lib/validators/chat";
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

  if (markRead) {
    await prisma.chatConversation.updateMany({
      where: { id: conversation.id, unreadForVisitor: { gt: 0 } },
      data: { unreadForVisitor: 0 },
    });
    return { status: conversation.status, unread: 0, messages: messages.map(toView) };
  }

  // Re-read after the message query so the count isn't older than the messages returned.
  const fresh = await prisma.chatConversation.findUnique({
    where: { id: conversation.id },
    select: { status: true, unreadForVisitor: true },
  });
  return {
    status: fresh?.status ?? conversation.status,
    unread: fresh?.unreadForVisitor ?? 0,
    messages: messages.map(toView),
  };
}

/**
 * Pollers read with `seq > cursor`, so within one conversation a message must never
 * become visible after one with a higher seq. Updating the conversation row first takes
 * its row lock; a concurrent insert into the same conversation waits for this commit
 * before drawing its seq, so seq order matches commit order per conversation.
 */
async function addMessage(
  conversationId: string,
  sender: ChatSender,
  body: string,
  counters: Prisma.ChatConversationUpdateInput = {},
  userId?: string,
) {
  const [, message] = await prisma.$transaction([
    prisma.chatConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date(), ...counters },
    }),
    prisma.chatMessage.create({
      data: { conversationId, sender, body, userId },
      select: messageSelect,
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
      customer: { select: { id: true, code: true, name: true } },
    },
  });
  if (!conversation) return null;

  // Last 9 digits match "0812…", "62812…" and "+62 812…" stored without separators.
  const phoneTail = conversation.visitorPhone.slice(-9);
  const [previous, customerMatches] = await Promise.all([
    prisma.chatConversation.findMany({
      where: { visitorPhone: conversation.visitorPhone, id: { not: id } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, createdAt: true, status: true },
    }),
    conversation.customer || phoneTail.length < 9
      ? []
      : prisma.customer.findMany({
          where: { phone: { contains: phoneTail }, isActive: true },
          take: 3,
          select: { id: true, code: true, name: true },
        }),
  ]);

  return {
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    previous: previous.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    customerMatches,
  };
}

/** `null` when the conversation doesn't exist. */
export async function getAgentMessages(id: string, after: number) {
  const exists = await prisma.chatConversation.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return null;
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

const CHAT_AGENT_ROLES = Object.values(Role).filter((role) => hasPermission(role, "chat:write"));

/** Active users who can reply to chats, for the assign dropdown. */
export async function listChatAgents() {
  return prisma.user.findMany({
    where: { isActive: true, role: { in: CHAT_AGENT_ROLES } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export class ChatUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatUpdateError";
  }
}

/** Close/reopen, assign, link a Customer. Each change is written to the activity log. */
export async function updateConversation(id: string, userId: string, input: UpdateConversationInput) {
  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true } },
      customer: { select: { code: true, name: true } },
    },
  });
  if (!conversation) return null;

  const actor = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  const who = actor?.name ?? "CS";
  const data: Prisma.ChatConversationUpdateInput = {};
  const changes: string[] = [];

  if (input.assignedToId !== undefined && input.assignedToId !== conversation.assignedToId) {
    if (input.assignedToId === null) {
      data.assignedTo = { disconnect: true };
      changes.push(`unassigned from ${conversation.assignedTo?.name ?? "-"}`);
    } else {
      const agent = await prisma.user.findFirst({
        where: { id: input.assignedToId, isActive: true, role: { in: CHAT_AGENT_ROLES } },
        select: { id: true, name: true },
      });
      if (!agent) throw new ChatUpdateError("CS tidak ditemukan atau tidak punya akses chat");
      data.assignedTo = { connect: { id: agent.id } };
      changes.push(`assigned to ${agent.name}`);
    }
  }

  if (input.customerId !== undefined && input.customerId !== conversation.customerId) {
    if (input.customerId === null) {
      data.customer = { disconnect: true };
      changes.push(`unlinked from customer ${conversation.customer?.code ?? "-"}`);
    } else {
      const customer = await prisma.customer.findUnique({
        where: { id: input.customerId },
        select: { id: true, code: true, name: true },
      });
      if (!customer) throw new ChatUpdateError("Customer tidak ditemukan");
      data.customer = { connect: { id: customer.id } };
      changes.push(`linked to customer ${customer.code} (${customer.name})`);
    }
  }

  if (Object.keys(data).length > 0) {
    await prisma.chatConversation.update({ where: { id }, data });
  }

  if (input.status && input.status !== conversation.status) {
    await addMessage(
      id,
      "SYSTEM",
      input.status === "CLOSED" ? `Chat ditutup oleh ${who}` : `Chat dibuka kembali oleh ${who}`,
      { status: input.status, unreadForAgent: 0 },
    );
    changes.push(input.status === "CLOSED" ? "closed" : "reopened");
  }

  if (changes.length > 0) {
    await logActivity({
      type: "CHAT_UPDATED",
      message: `Chat with ${conversation.visitorName}: ${changes.join(", ")}`,
      userId,
      entityType: "ChatConversation",
      entityId: id,
      metadata: { changes },
    });
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
