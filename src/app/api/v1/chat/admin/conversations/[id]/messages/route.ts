import { chatAfterSchema, chatMessageSchema } from "@/lib/validators/chat";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getAgentMessages, sendAgentMessage } from "@/services/chat.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requirePermission("chat:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const parsed = chatAfterSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return apiError("VALIDATION_ERROR", "Invalid query", 400);

  return apiSuccess(await getAgentMessages(id, parsed.data.after));
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePermission("chat:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Pesan tidak valid", 400);
  }

  const message = await sendAgentMessage(id, auth.actor.id, parsed.data.body);
  if (!message) return apiError("NOT_FOUND", "Conversation not found", 404);
  return apiSuccess(message, 201);
}
