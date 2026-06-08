import { describe, it, expect } from "vitest";
import { ShipmentStatus } from "@prisma/client";
import {
  canTransitionStatus,
  VALID_STATUS_TRANSITIONS,
} from "@/lib/shipment-status";

describe("shipment status transitions", () => {
  it("allows CREATED to PICKED_UP", () => {
    expect(
      canTransitionStatus(ShipmentStatus.CREATED, ShipmentStatus.PICKED_UP),
    ).toBe(true);
  });

  it("blocks DELIVERED to any other status", () => {
    expect(VALID_STATUS_TRANSITIONS.DELIVERED).toEqual([]);
    expect(
      canTransitionStatus(ShipmentStatus.DELIVERED, ShipmentStatus.CREATED),
    ).toBe(false);
  });

  it("allows RETURNED from IN_TRANSIT", () => {
    expect(
      canTransitionStatus(ShipmentStatus.IN_TRANSIT, ShipmentStatus.RETURNED),
    ).toBe(true);
  });
});
