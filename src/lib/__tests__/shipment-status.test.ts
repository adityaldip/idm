import { describe, it, expect } from "vitest";
import {
  allowedNextStatuses,
  canTransitionStatus,
  initialStatus,
  toStatusCode,
  trackingJourney,
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

});

describe("tracking journey", () => {
  // Mirrors a flexible real-world setup: most statuses are "allowFromAny",
  // so the journey must come from the recorded history, not the chain.
  const FLEX: StatusDefLike[] = [
    def("created", 0, { isInitial: true }),
    def("port", 1, { allowFromAny: true }),
    def("transit", 2, { allowFromAny: true }),
    def("city", 3, { allowFromAny: true }),
    def("delivered", 4, { isFinal: true, allowFromAny: true, color: "emerald" }),
    def("returned", 5, { isFinal: true, allowFromAny: true, color: "red" }),
  ];
  const states = (j: ReturnType<typeof trackingJourney>) =>
    j.steps.map((s) => [s.id, s.state]);

  it("follows the recorded history, with the final status as the target", () => {
    const journey = trackingJourney("transit", ["created", "port", "transit"], FLEX);
    expect(states(journey)).toEqual([
      ["created", "done"],
      ["port", "done"],
      ["transit", "current"],
    ]);
    expect(journey.target?.id).toBe("delivered");
    expect(journey.halted).toBe(false);
    // 3 steps done, "city" and "delivered" still ahead.
    expect(journey.progress).toBe(60);
  });

  it("keeps history order even when it differs from the configured order", () => {
    const journey = trackingJourney("port", ["created", "transit", "port"], FLEX);
    expect(journey.steps.map((s) => s.id)).toEqual(["created", "transit", "port"]);
  });

  it("collapses a status repeated back-to-back (e.g. a retried delivery)", () => {
    const journey = trackingJourney("city", ["created", "city", "city"], FLEX);
    expect(journey.steps.map((s) => s.id)).toEqual(["created", "city"]);
  });

  it("completes at a final status with no target left", () => {
    const journey = trackingJourney(
      "delivered",
      ["created", "transit", "delivered"],
      FLEX,
    );
    expect(journey.steps.every((s) => s.state === "done")).toBe(true);
    expect(journey.target).toBeUndefined();
    expect(journey.progress).toBe(100);
  });

  it("halts on a red (problem) status instead of reading as complete", () => {
    const journey = trackingJourney(
      "returned",
      ["created", "port", "transit", "returned"],
      FLEX,
    );
    expect(states(journey).at(-1)).toEqual(["returned", "problem"]);
    expect(journey.halted).toBe(true);
    expect(journey.target).toBeUndefined();
    expect(journey.progress).toBeLessThan(100);
  });

  it("falls back to the current status when no history was logged", () => {
    const journey = trackingJourney("created", [], FLEX);
    expect(states(journey)).toEqual([["created", "current"]]);
  });

});

describe("status codes", () => {
  it("derives codes from labels", () => {
    expect(toStatusCode("Muat Barang")).toBe("MUAT_BARANG");
    expect(toStatusCode("  bongkar di site! ")).toBe("BONGKAR_DI_SITE");
  });
});
