"use server";

import { revalidatePath } from "next/cache";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { saveShipmentStatusesSchema } from "@/lib/validators/shipment-status";
import {
  saveShipmentStatuses,
  StatusInUseError,
} from "@/services/shipment-status.service";

export async function saveShipmentStatusesAction(payload: unknown) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "settings:write")) {
    return { error: "Forbidden" };
  }

  const parsed = saveShipmentStatusesSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        "Data status tidak valid. Periksa kembali isian Anda.",
    };
  }

  try {
    await saveShipmentStatuses(parsed.data);
    revalidatePath("/settings/shipment-status");
    revalidatePath("/shipments");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    if (error instanceof StatusInUseError) return { error: error.message };
    return {
      error:
        error instanceof Error ? error.message : "Gagal menyimpan status.",
    };
  }
}
