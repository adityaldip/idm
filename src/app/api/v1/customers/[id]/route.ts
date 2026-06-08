import { updateCustomerSchema } from "@/lib/validators/customer";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "@/services/customer.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("customers:read");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return apiError("NOT_FOUND", "Customer not found", 404);
  }

  return apiSuccess(customer);
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission("customers:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  try {
    const customer = await updateCustomer(id, parsed.data);
    return apiSuccess(customer);
  } catch {
    return apiError("NOT_FOUND", "Customer not found", 404);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission("customers:write");
  if ("error" in auth) return auth.error;

  const { id } = await context.params;

  try {
    await deleteCustomer(id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return apiError("DELETE_FAILED", message, 400);
  }
}
