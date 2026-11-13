import { quickReplySchema } from "@/lib/validators/chat";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireVisitorConversation } from "@/lib/api/chat-visitor";
import { rateLimit } from "@/lib/rate-limit";
import { sendQuickReply, UnknownQuickReplyError } from "@/services/chat.service";

export async function POST(request: Request) {
  const visitor = await requireVisitorConversation();
  if ("error" in visitor) return visitor.error;

  const limit = rateLimit(`chat-msg:${visitor.conversation.id}`, 20, 60_000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Terlalu banyak pesan. Tunggu sebentar.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = quickReplySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Pilihan tidak valid", 400);
  }

  try {
    await sendQuickReply(visitor.conversation, parsed.data.index);
  } catch (error) {
    if (error instanceof UnknownQuickReplyError) {
      return apiError("NOT_FOUND", error.message, 404);
    }
    throw error;
  }
  return apiSuccess({ ok: true }, 201);
}
