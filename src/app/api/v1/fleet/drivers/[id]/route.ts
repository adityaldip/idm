import { updateDriverSchema } from "@/lib/validators/fleet";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteDriver,
  getDriverById,
  updateDriver,
} from "@/services/fleet.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("fleet:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const driver = await getDriverById(id);

  if (!driver) {
    return apiError("NOT_FOUND", "Driver not found", 404);
  }

  return apiSuccess(driver);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission("fleet:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateDriverSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const driver = await updateDriver(id, parsed.data);
    return apiSuccess(driver);
  } catch {
    return apiError("NOT_FOUND", "Driver not found", 404);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission("fleet:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    await deleteDriver(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return apiError("DELETE_FAILED", message, 400);
  }
}
