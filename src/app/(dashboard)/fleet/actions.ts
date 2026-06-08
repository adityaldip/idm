"use server";

import { revalidatePath } from "next/cache";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import {
  createDriver,
  updateDriver,
  deleteDriver,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "@/services/fleet.service";
import {
  createDriverSchema,
  updateDriverSchema,
  createVehicleSchema,
  updateVehicleSchema,
} from "@/lib/validators/fleet";

export async function saveDriverAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "fleet:write")) return { error: "Forbidden" };

  const licenseRaw = formData.get("licenseExpiry");
  const vehicleId = formData.get("vehicleId");

  const raw = {
    code: formData.get("code"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    licenseNumber: formData.get("licenseNumber"),
    licenseExpiry: licenseRaw
      ? new Date(String(licenseRaw)).toISOString()
      : undefined,
    status: formData.get("status"),
    vehicleId: vehicleId === "" ? undefined : vehicleId,
    photoUrl: formData.get("photoUrl") || undefined,
  };

  if (id) {
    const parsed = updateDriverSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid data" };
    await updateDriver(id, parsed.data);
  } else {
    const parsed = createDriverSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid data" };
    await createDriver(parsed.data);
  }

  revalidatePath("/fleet/drivers");
  return { success: true };
}

export async function deleteDriverAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "fleet:write")) return { error: "Forbidden" };

  try {
    await deleteDriver(id);
    revalidatePath("/fleet/drivers");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete driver",
    };
  }
}

export async function saveVehicleAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "fleet:write")) return { error: "Forbidden" };

  const num = (key: string) => {
    const v = formData.get(key);
    return v && String(v) !== "" ? Number(v) : undefined;
  };
  const str = (key: string) => {
    const v = formData.get(key);
    return v && String(v) !== "" ? String(v) : undefined;
  };
  const branchId = formData.get("branchId");
  const lastServiceRaw = formData.get("lastServiceAt");

  const raw = {
    plateNumber: formData.get("plateNumber"),
    type: formData.get("type"),
    brand: str("brand"),
    model: str("model"),
    year: num("year"),
    capacity: num("capacity"),
    status: formData.get("status"),
    branchId: branchId === "" ? undefined : branchId,
    lastServiceAt: lastServiceRaw
      ? new Date(String(lastServiceRaw)).toISOString()
      : undefined,
    notes: str("notes"),
  };

  try {
    if (id) {
      const parsed = updateVehicleSchema.safeParse(raw);
      if (!parsed.success) return { error: "Invalid data" };
      await updateVehicle(id, parsed.data);
    } else {
      const parsed = createVehicleSchema.safeParse(raw);
      if (!parsed.success) return { error: "Invalid data" };
      await createVehicle(parsed.data);
    }
    revalidatePath("/fleet/vehicles");
    revalidatePath("/fleet/drivers");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to save vehicle",
    };
  }
}

export async function deleteVehicleAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "fleet:write")) return { error: "Forbidden" };

  try {
    await deleteVehicle(id);
    revalidatePath("/fleet/vehicles");
    revalidatePath("/fleet/drivers");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete vehicle",
    };
  }
}
