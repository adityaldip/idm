import {
  createShipmentSchema,
  shipmentListSchema,
} from "@/lib/validators/shipment";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createShipment, listShipments } from "@/services/shipment.service";

export async function GET(request: Request) {
  const auth = await requirePermission("shipments:read");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const parsed = shipmentListSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listShipments(parsed.data, auth.actor);
  return apiSuccess(result);
}

export async function POST(request: Request) {
  const auth = await requirePermission("shipments:write");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createShipmentSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const shipment = await createShipment(parsed.data, auth.actor.id);
    return apiSuccess(shipment, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create shipment";
    return apiError("CREATE_FAILED", message, 400);
  }
}
