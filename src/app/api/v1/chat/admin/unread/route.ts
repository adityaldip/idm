import { requirePermission } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getAgentUnreadTotal } from "@/services/chat.service";

export async function GET() {
  const auth = await requirePermission("chat:read");
  if ("error" in auth) return auth.error;

  return apiSuccess({ unread: await getAgentUnreadTotal() });
}
