"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "@/lib/validators/customer";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customer.service";

function parseCustomerForm(formData: FormData, forUpdate = false) {
  return {
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone"),
    company: formData.get("company") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    notes: formData.get("notes") || undefined,
    ...(forUpdate && { isActive: formData.get("isActive") === "on" }),
  };
}

export async function createCustomerAction(formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "customers:write")) {
    return { error: "Forbidden" };
  }

  const parsed = createCustomerSchema.safeParse(parseCustomerForm(formData));
  if (!parsed.success) return { error: "Invalid form data." };

  try {
    await createCustomer(parsed.data, actor.id);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "customers:write")) {
    return { error: "Forbidden" };
  }

  const raw = parseCustomerForm(formData, true);
  const parsed = updateCustomerSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid form data." };

  try {
    await updateCustomer(id, parsed.data);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update customer",
    };
  }
}

export async function deleteCustomerAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "customers:write")) {
    return { error: "Forbidden" };
  }

  try {
    await deleteCustomer(id);
    revalidatePath("/customers");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}
