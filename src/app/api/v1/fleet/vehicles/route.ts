import {
  createVehicleSchema,
  vehicleListSchema,
} from "@/lib/validators/fleet";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createVehicle, listVehicles } from "@/services/fleet.service";

export async function GET(request: Request) {
  const auth = await requirePermission("fleet:read");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const parsed = vehicleListSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listVehicles(parsed.data);
  return apiSuccess(result);
}

export async function POST(request: Request) {
  const auth = await requirePermission("fleet:write");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createVehicleSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const vehicle = await createVehicle(parsed.data);
    return apiSuccess(vehicle, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create vehicle";
    return apiError("CREATE_FAILED", message, 400);
  }
}
