import { requirePermission } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { listConversations } from "@/services/chat.service";

export async function GET(request: Request) {
  const auth = await requirePermission("chat:read");
  if ("error" in auth) return auth.error;

  const status = new URL(request.url).searchParams.get("status") === "CLOSED" ? "CLOSED" : "OPEN";
  return apiSuccess(await listConversations(status));
}
