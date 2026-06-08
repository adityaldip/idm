import { requirePermission } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { getDashboardKpis } from "@/services/analytics.service";

export async function GET() {
  const auth = await requirePermission("dashboard:view");
  if ("error" in auth) return auth.error;

  const data = await getDashboardKpis(auth.actor);
  return apiSuccess(data);
}
