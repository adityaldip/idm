import {
  findPublicTrackingMatches,
  getPublicTracking,
} from "@/services/tracking.service";
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

  // `number` may be a tracking number or a customer PO number; a PO can cover
  // several shipments, so the caller has to disambiguate in that case.
  const matches = await findPublicTrackingMatches(number);

  if (matches.length === 0) {
    return apiError("NOT_FOUND", "Tracking number or PO number not found", 404);
  }

  if (matches.length > 1) {
    return apiError(
      "MULTIPLE_MATCHES",
      "That PO number covers several shipments. Retry with one tracking number.",
      409,
      { trackingNumbers: matches.map((match) => match.trackingNumber) },
    );
  }

  const shipment = await getPublicTracking(matches[0].trackingNumber);

  if (!shipment) {
    return apiError("NOT_FOUND", "Tracking number or PO number not found", 404);
  }

  return apiSuccess(shipment);
}
