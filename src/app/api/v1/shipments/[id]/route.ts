import { updateShipmentSchema } from "@/lib/validators/shipment";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteShipment,
  getShipmentById,
  updateShipment,
} from "@/services/shipment.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("shipments:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const shipment = await getShipmentById(id, auth.actor);

  if (!shipment) {
    return apiError("NOT_FOUND", "Shipment not found", 404);
  }

  return apiSuccess(shipment);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission("shipments:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateShipmentSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  const shipment = await updateShipment(id, parsed.data, auth.actor.id, auth.actor);
  if (!shipment) {
    return apiError("NOT_FOUND", "Shipment not found", 404);
  }

  return apiSuccess(shipment);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission("shipments:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const deleted = await deleteShipment(id, auth.actor);

  if (!deleted) {
    return apiError("NOT_FOUND", "Shipment not found", 404);
  }

  return apiSuccess({ deleted: true });
}
