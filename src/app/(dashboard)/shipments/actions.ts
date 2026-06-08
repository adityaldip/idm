"use server";

import { revalidatePath } from "next/cache";
import { createShipmentSchema, updateShipmentSchema } from "@/lib/validators/shipment";
import { addTrackingEventSchema } from "@/lib/validators/tracking";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import {
  createShipment,
  updateShipment,
  deleteShipment,
} from "@/services/shipment.service";
import { assertActiveServiceOffering } from "@/services/cms.service";
import {
  addTrackingEvent,
  InvalidStatusTransitionError,
} from "@/services/tracking.service";

function parseShipmentForm(
  formData: FormData,
  mode: "create" | "update" = "create",
) {
  const num = (key: string) => {
    const v = formData.get(key);
    return v && String(v) !== "" ? Number(v) : undefined;
  };
  const str = (key: string) => {
    const v = formData.get(key);
    return v && String(v) !== "" ? String(v) : undefined;
  };
  const branch = (key: string) => {
    const v = formData.get(key);
    return v && String(v) !== "" ? String(v) : undefined;
  };
  const fleetRef = (key: string) => {
    const v = formData.get(key);
    if (!v || String(v) === "") {
      return mode === "update" ? null : undefined;
    }
    return String(v);
  };

  return {
    customerId: formData.get("customerId"),
    serviceOfferingId: formData.get("serviceOfferingId"),
    senderName: formData.get("senderName"),
    senderPhone: formData.get("senderPhone"),
    senderAddress: formData.get("senderAddress"),
    senderCity: formData.get("senderCity"),
    recipientName: formData.get("recipientName"),
    recipientPhone: formData.get("recipientPhone"),
    recipientAddress: formData.get("recipientAddress"),
    recipientCity: formData.get("recipientCity"),
    originBranchId: branch("originBranchId"),
    destinationBranchId: branch("destinationBranchId"),
    weight: num("weight"),
    packageCount: num("packageCount") ?? 1,
    description: str("description"),
    shippingCost: num("shippingCost"),
    totalCost: num("totalCost"),
    notes: str("notes"),
    status: str("status"),
    vehicleId: fleetRef("vehicleId"),
    driverId: fleetRef("driverId"),
  };
}

export async function createShipmentAction(formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "shipments:write")) {
    return { error: "Forbidden" };
  }

  const raw = parseShipmentForm(formData);
  const parsed = createShipmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all required fields." };
  }

  try {
    await assertActiveServiceOffering(parsed.data.serviceOfferingId);
    const shipment = await createShipment(parsed.data, actor.id);
    revalidatePath("/shipments");
    return { success: true, id: shipment.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create shipment",
    };
  }
}

export async function updateShipmentAction(id: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "shipments:write")) {
    return { error: "Forbidden" };
  }

  const raw = parseShipmentForm(formData, "update");
  const parsed = updateShipmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all required fields." };
  }

  try {
    if (parsed.data.serviceOfferingId) {
      await assertActiveServiceOffering(parsed.data.serviceOfferingId);
    }
    const shipment = await updateShipment(id, parsed.data, actor.id, actor);
    if (!shipment) return { error: "Shipment not found or access denied." };
    revalidatePath("/shipments");
    revalidatePath(`/shipments/${id}`);
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update shipment",
    };
  }
}

export async function deleteShipmentAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "shipments:write")) {
    return { error: "Forbidden" };
  }

  try {
    const deleted = await deleteShipment(id, actor);
    if (!deleted) return { error: "Shipment not found or access denied." };
    revalidatePath("/shipments");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to delete shipment",
    };
  }
}

export async function addTrackingAction(shipmentId: string, formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "tracking:write")) {
    return { error: "Forbidden" };
  }

  const raw = {
    status: formData.get("status"),
    location: formData.get("location"),
    description: formData.get("description") || undefined,
    branchId: formData.get("branchId") || undefined,
  };

  const parsed = addTrackingEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid tracking update data." };
  }

  try {
    await addTrackingEvent(shipmentId, parsed.data, actor.id, actor);
    revalidatePath(`/shipments/${shipmentId}`);
    revalidatePath("/shipments");
    return { success: true };
  } catch (error) {
    if (error instanceof InvalidStatusTransitionError) {
      return { error: error.message };
    }
    return { error: "Failed to add tracking update." };
  }
}
