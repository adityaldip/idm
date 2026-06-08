import { getPublicTracking } from "@/services/tracking.service";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ number: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const ip = getClientIp(request);
  const limit = rateLimit(`tracking:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    return apiError("RATE_LIMITED", "Too many requests. Try again later.", 429);
  }

  const { number } = await context.params;
  const shipment = await getPublicTracking(number);

  if (!shipment) {
    return apiError("NOT_FOUND", "Tracking number not found", 404);
  }

  return apiSuccess(shipment);
}
