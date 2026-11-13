import { chatAfterSchema, chatMessageSchema } from "@/lib/validators/chat";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireVisitorConversation } from "@/lib/api/chat-visitor";
import { rateLimit } from "@/lib/rate-limit";
import { getVisitorMessages, sendVisitorMessage } from "@/services/chat.service";

/**
 * Polled by the widget: `read=1` while it is open, `read=0` to only watch the unread count.
 * No chat yet is a normal state for every new visitor, so it answers `null` rather than 401.
 */
export async function GET(request: Request) {
  const visitor = await requireVisitorConversation();
  if ("error" in visitor) return apiSuccess(null);

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = chatAfterSchema.safeParse(params);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query", 400);
  }

  return apiSuccess(
    await getVisitorMessages(visitor.conversation, parsed.data.after, parsed.data.read === "1"),
  );
}

export async function POST(request: Request) {
  const visitor = await requireVisitorConversation();
  if ("error" in visitor) return visitor.error;

  const limit = rateLimit(`chat-msg:${visitor.conversation.id}`, 20, 60_000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Terlalu banyak pesan. Tunggu sebentar.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Pesan tidak valid", 400);
  }

  await sendVisitorMessage(visitor.conversation, parsed.data.body);
  return apiSuccess({ ok: true }, 201);
}
