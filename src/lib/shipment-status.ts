import { ShipmentStatus } from "@prisma/client";

export const VALID_STATUS_TRANSITIONS: Record<
  ShipmentStatus,
  ShipmentStatus[]
> = {
  CREATED: [ShipmentStatus.PICKED_UP, ShipmentStatus.RETURNED],
  PICKED_UP: [ShipmentStatus.IN_WAREHOUSE, ShipmentStatus.RETURNED],
  IN_WAREHOUSE: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.RETURNED],
  IN_TRANSIT: [ShipmentStatus.OUT_FOR_DELIVERY, ShipmentStatus.RETURNED],
  OUT_FOR_DELIVERY: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED],
  DELIVERED: [],
  RETURNED: [],
};

export function canTransitionStatus(
  from: ShipmentStatus,
  to: ShipmentStatus,
): boolean {
  if (from === to) return true;
  return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
