import { updateVehicleSchema } from "@/lib/validators/fleet";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteVehicle,
  getVehicleById,
  updateVehicle,
} from "@/services/fleet.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("fleet:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    return apiError("NOT_FOUND", "Vehicle not found", 404);
  }

  return apiSuccess(vehicle);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission("fleet:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateVehicleSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const vehicle = await updateVehicle(id, parsed.data);
    return apiSuccess(vehicle);
  } catch {
    return apiError("NOT_FOUND", "Vehicle not found", 404);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission("fleet:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    await deleteVehicle(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return apiError("DELETE_FAILED", message, 400);
  }
}
