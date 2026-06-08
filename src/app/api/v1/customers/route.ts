import {
  createCustomerSchema,
  customerListSchema,
} from "@/lib/validators/customer";
import { requirePermission } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createCustomer, listCustomers } from "@/services/customer.service";

export async function GET(request: Request) {
  const auth = await requirePermission("customers:read");
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const parsed = customerListSchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid query parameters", 400, parsed.error.flatten());
  }

  const result = await listCustomers(parsed.data);
  return apiSuccess(result);
}

export async function POST(request: Request) {
  const auth = await requirePermission("customers:write");
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = createCustomerSchema.safeParse(body);

  if (!parsed.success) {
    return apiError("VALIDATION_ERROR", "Invalid request body", 400, parsed.error.flatten());
  }

  const customer = await createCustomer(parsed.data, auth.actor.id);
  return apiSuccess(customer, 201);
}
