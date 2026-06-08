"use server";

import { revalidatePath } from "next/cache";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { createBranchSchema, updateBranchSchema } from "@/lib/validators/branch";
import { createBranch, updateBranch, deleteBranch } from "@/services/branch.service";

function parseBranchForm(formData: FormData) {
  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");

  return {
    code: formData.get("code"),
    name: formData.get("name"),
    address: formData.get("address"),
    city: formData.get("city"),
    province: formData.get("province"),
    postalCode: formData.get("postalCode") || undefined,
    phone: formData.get("phone"),
    email: formData.get("email") || undefined,
    latitude:
      latRaw && String(latRaw) !== "" ? Number(latRaw) : undefined,
    longitude:
      lngRaw && String(lngRaw) !== "" ? Number(lngRaw) : undefined,
    isHeadquarters: formData.get("isHeadquarters") === "on",
    isActive: formData.get("isActive") === "on",
  };
}

export async function saveBranchAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "branches:write")) {
    return { error: "Forbidden" };
  }

  const raw = parseBranchForm(formData);

  try {
    if (id) {
      const parsed = updateBranchSchema.safeParse(raw);
      if (!parsed.success) return { error: "Invalid form data." };
      await updateBranch(id, parsed.data);
    } else {
      const parsed = createBranchSchema.safeParse(raw);
      if (!parsed.success) return { error: "Invalid form data." };
      await createBranch(parsed.data);
    }

    revalidatePath("/branches");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save branch",
    };
  }
}

export async function deleteBranchAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "branches:write")) {
    return { error: "Forbidden" };
  }

  try {
    await deleteBranch(id);
    revalidatePath("/branches");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete branch",
    };
  }
}
