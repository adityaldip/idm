import { addTrackingEventSchema } from "@/lib/validators/tracking";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  addTrackingEvent,
  InvalidStatusTransitionError,
} from "@/services/tracking.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const auth = await requirePermission("tracking:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = addTrackingEventSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const result = await addTrackingEvent(
      id,
      parsed.data,
      auth.actor.id,
      auth.actor,
    );

    if (!result) {
      return apiError("NOT_FOUND", "Shipment not found", 404);
    }

    return apiSuccess(result, 201);
  } catch (error) {
    if (error instanceof InvalidStatusTransitionError) {
      return apiError("INVALID_TRANSITION", error.message, 422);
    }
    throw error;
  }
}
