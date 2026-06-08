import {
  createDriverSchema,
  driverListSchema,
} from "@/lib/validators/fleet";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createDriver, listDrivers } from "@/services/fleet.service";

export async function GET(request: Request) {
  const auth = await requirePermission("fleet:read");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const parsed = driverListSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listDrivers(parsed.data);
  return apiSuccess(result);
}

export async function POST(request: Request) {
  const auth = await requirePermission("fleet:write");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createDriverSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const driver = await createDriver(parsed.data);
    return apiSuccess(driver, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create driver";
    return apiError("CREATE_FAILED", message, 400);
  }
}
