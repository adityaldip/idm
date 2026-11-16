import { chatListSchema } from "@/lib/validators/chat";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { listConversations } from "@/services/chat.service";

export async function GET(request: Request) {
  const auth = await requirePermission("chat:read");
  if ("error" in auth) return auth.error;

  const parsed = chatListSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten());
  }
  return apiSuccess(await listConversations(parsed.data.status));
}
