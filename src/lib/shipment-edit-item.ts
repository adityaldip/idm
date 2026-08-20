import type { ItemUnit, Shipment, ShipmentItem } from "@prisma/client";

export type ShipmentEditItemLine = {
  name: string;
  quantity: number;
  unit: ItemUnit;
  weightKg: number | null;
  volumeM3: number | null;
  notes: string | null;
};

export type ShipmentEditItem = {
  id: string;
  trackingNumber: string;
  poNumber: string | null;
  customerId: string;
  serviceOfferingId: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: string;
  originBranchId: string | null;
  destinationBranchId: string | null;
  weight: number | null;
  packageCount: number;
  description: string | null;
  shippingCost: number | null;
  notes: string | null;
  vehicleId: string | null;
  driverId: string | null;
  items: ShipmentEditItemLine[];
};

export function toShipmentEditItem(
  shipment: Pick<
    Shipment,
    | "id"
    | "trackingNumber"
    | "poNumber"
    | "customerId"
    | "serviceOfferingId"
    | "senderName"
    | "senderPhone"
    | "senderAddress"
    | "senderCity"
    | "recipientName"
    | "recipientPhone"
    | "recipientAddress"
    | "recipientCity"
    | "originBranchId"
    | "destinationBranchId"
    | "weight"
    | "packageCount"
    | "description"
    | "shippingCost"
    | "notes"
    | "vehicleId"
    | "driverId"
  > & { items?: ShipmentItem[] },
): ShipmentEditItem {
  return {
    id: shipment.id,
    trackingNumber: shipment.trackingNumber,
    poNumber: shipment.poNumber,
    customerId: shipment.customerId,
    serviceOfferingId: shipment.serviceOfferingId,
    senderName: shipment.senderName,
    senderPhone: shipment.senderPhone,
    senderAddress: shipment.senderAddress,
    senderCity: shipment.senderCity,
    recipientName: shipment.recipientName,
    recipientPhone: shipment.recipientPhone,
    recipientAddress: shipment.recipientAddress,
    recipientCity: shipment.recipientCity,
    originBranchId: shipment.originBranchId,
    destinationBranchId: shipment.destinationBranchId,
    weight: shipment.weight,
    packageCount: shipment.packageCount,
    description: shipment.description,
    shippingCost:
      shipment.shippingCost != null ? Number(shipment.shippingCost) : null,
    notes: shipment.notes,
    vehicleId: shipment.vehicleId,
    driverId: shipment.driverId,
    items: (shipment.items ?? []).map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit,
      weightKg: item.weightKg,
      volumeM3: item.volumeM3,
      notes: item.notes,
    })),
  };
}
