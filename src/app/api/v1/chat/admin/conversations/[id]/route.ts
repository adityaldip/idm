import { updateConversationSchema } from "@/lib/validators/chat";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ChatUpdateError, getConversationDetail, updateConversation } from "@/services/chat.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("chat:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const detail = await getConversationDetail(id);
  if (!detail) return apiError("NOT_FOUND", "Conversation not found", 404);
  return apiSuccess(detail);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission("chat:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateConversationSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid request body",
      400,
      parsed.error.flatten(),
    );
  }

  try {
    const detail = await updateConversation(id, auth.actor.id, parsed.data);
    if (!detail) return apiError("NOT_FOUND", "Conversation not found", 404);
    return apiSuccess(detail);
  } catch (error) {
    if (error instanceof ChatUpdateError) return apiError("VALIDATION_ERROR", error.message, 400);
    throw error;
  }
}
