import { startChatSchema } from "@/lib/validators/chat";
import { apiError, apiSuccess } from "@/lib/api/response";
import { setVisitorCookie } from "@/lib/api/chat-visitor";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getChatSettings, getVisitorMessages, startConversation } from "@/services/chat.service";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = rateLimit(`chat-start:${ip}`, 3, 10 * 60_000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.", 429);
  }

  const settings = await getChatSettings();
  if (!settings.enabled) {
    return apiError("CHAT_DISABLED", "Live chat sedang tidak aktif", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = startChatSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Data tidak valid",
      400,
      parsed.error.flatten(),
    );
  }

  const { token, conversation } = await startConversation(parsed.data);
  await setVisitorCookie(token);

  return apiSuccess(await getVisitorMessages(conversation, 0, true), 201);
}
