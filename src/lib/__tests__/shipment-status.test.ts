import { describe, it, expect } from "vitest";
import {
  allowedNextStatuses,
  canTransitionStatus,
  initialStatus,
  statusProgress,
  toStatusCode,
} from "@/lib/shipment-status";
import type { StatusDefLike } from "@/lib/shipment-status";

function def(
  id: string,
  sortOrder: number,
  overrides: Partial<StatusDefLike> = {},
): StatusDefLike {
  return {
    id,
    code: id.toUpperCase(),
    label: id,
    color: "slate",
    sortOrder,
    isInitial: false,
    isFinal: false,
    allowFromAny: false,
    isActive: true,
    ...overrides,
  };
}

const DEFS: StatusDefLike[] = [
  def("created", 0, { isInitial: true }),
  def("picked", 1),
  def("transit", 2),
  def("delivered", 3, { isFinal: true }),
  def("returned", 4, { isFinal: true, allowFromAny: true }),
];

describe("shipment status transitions", () => {
  it("allows a step forward along the configured order", () => {
    expect(canTransitionStatus("created", "picked", DEFS)).toBe(true);
  });

  it("blocks skipping a status in the chain", () => {
    expect(canTransitionStatus("created", "transit", DEFS)).toBe(false);
  });

  it("blocks any transition out of a final status", () => {
    expect(allowedNextStatuses("delivered", DEFS)).toEqual([]);
    expect(canTransitionStatus("delivered", "created", DEFS)).toBe(false);
  });

  it("allows an allowFromAny status from anywhere", () => {
    expect(canTransitionStatus("transit", "returned", DEFS)).toBe(true);
    expect(canTransitionStatus("created", "returned", DEFS)).toBe(true);
  });

  it("follows a reordered configuration", () => {
    const reordered = [
      def("created", 0, { isInitial: true }),
      def("transit", 1),
      def("picked", 2),
      def("delivered", 3, { isFinal: true }),
    ];
    expect(canTransitionStatus("created", "transit", reordered)).toBe(true);
    expect(canTransitionStatus("created", "picked", reordered)).toBe(false);
  });

  it("skips inactive statuses", () => {
    const withInactive = [
      def("created", 0, { isInitial: true }),
      def("picked", 1, { isActive: false }),
      def("transit", 2),
    ];
    expect(canTransitionStatus("created", "transit", withInactive)).toBe(true);
  });

  it("picks the initial status, falling back to the first in order", () => {
    expect(initialStatus(DEFS)?.id).toBe("created");
    expect(initialStatus([def("a", 5), def("b", 1)])?.id).toBe("b");
  });

  it("reports progress along the chain", () => {
    expect(statusProgress("created", DEFS)).toBe(25);
    expect(statusProgress("delivered", DEFS)).toBe(100);
    expect(statusProgress("returned", DEFS)).toBe(100);
  });

  it("derives codes from labels", () => {
    expect(toStatusCode("Muat Barang")).toBe("MUAT_BARANG");
    expect(toStatusCode("  bongkar di site! ")).toBe("BONGKAR_DI_SITE");
  });
});
