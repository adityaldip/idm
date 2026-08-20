import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { initialStatus, toStatusCode } from "@/lib/shipment-status";
import type { StatusDefLike } from "@/lib/shipment-status";
import type { SaveShipmentStatusesInput } from "@/lib/validators/shipment-status";

/** Defaults planted on first use so a fresh database still has a workflow. */
const SEED_STATUSES = [
  { code: "CREATED", label: "Created", color: "slate", sortOrder: 0, isInitial: true, isFinal: false, allowFromAny: false },
  { code: "PICKED_UP", label: "Picked Up", color: "blue", sortOrder: 1, isInitial: false, isFinal: false, allowFromAny: false },
  { code: "IN_WAREHOUSE", label: "In Warehouse", color: "indigo", sortOrder: 2, isInitial: false, isFinal: false, allowFromAny: false },
  { code: "IN_TRANSIT", label: "In Transit", color: "amber", sortOrder: 3, isInitial: false, isFinal: false, allowFromAny: false },
  { code: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "orange", sortOrder: 4, isInitial: false, isFinal: false, allowFromAny: false },
  { code: "DELIVERED", label: "Delivered", color: "emerald", sortOrder: 5, isInitial: false, isFinal: true, allowFromAny: false },
  { code: "RETURNED", label: "Returned", color: "red", sortOrder: 6, isInitial: false, isFinal: true, allowFromAny: true },
];

export class StatusInUseError extends Error {
  constructor(label: string, count: number) {
    super(
      `Status "${label}" masih dipakai ${count} data pengiriman. Nonaktifkan saja, jangan dihapus.`,
    );
    this.name = "StatusInUseError";
  }
}

export async function listShipmentStatuses() {
  const existing = await prisma.shipmentStatusDef.findMany({
    orderBy: { sortOrder: "asc" },
  });
  if (existing.length > 0) return existing;

  await prisma.shipmentStatusDef.createMany({ data: SEED_STATUSES });
  return prisma.shipmentStatusDef.findMany({ orderBy: { sortOrder: "asc" } });
}

/** Request-scoped so one render doesn't hit the table once per badge. */
export const getShipmentStatuses = cache(listShipmentStatuses);

export async function getStatusByCode(code: string) {
  return prisma.shipmentStatusDef.findUnique({ where: { code } });
}

export async function getInitialStatus(): Promise<StatusDefLike> {
  const defs = await listShipmentStatuses();
  const initial = initialStatus(defs);
  if (!initial) throw new Error("No active shipment status configured");
  return initial;
}

/**
 * The settings page posts the whole list, so this replaces the configuration in
 * one transaction: rows keep their id (and therefore every shipment pointing at
 * them), new rows are created, and removed rows are deleted only when unused.
 */
export async function saveShipmentStatuses(input: SaveShipmentStatusesInput) {
  const existing = await prisma.shipmentStatusDef.findMany();
  const keptIds = new Set(
    input.statuses.map((s) => s.id).filter((id): id is string => Boolean(id)),
  );

  const removed = existing.filter((def) => !keptIds.has(def.id));
  for (const def of removed) {
    const [shipments, tracking] = await Promise.all([
      prisma.shipment.count({ where: { statusId: def.id } }),
      prisma.trackingHistory.count({ where: { statusId: def.id } }),
    ]);
    if (shipments + tracking > 0) {
      throw new StatusInUseError(def.label, shipments + tracking);
    }
  }

  const usedCodes = new Set<string>();
  const rows = input.statuses.map((status, index) => {
    const base = status.code?.trim() || toStatusCode(status.label);
    let code = base || `STATUS_${index + 1}`;
    let suffix = 2;
    while (usedCodes.has(code)) code = `${base}_${suffix++}`;
    usedCodes.add(code);

    return {
      id: status.id,
      code,
      label: status.label.trim(),
      color: status.color,
      sortOrder: index,
      isInitial: index === input.initialIndex,
      isFinal: status.isFinal,
      allowFromAny: status.allowFromAny,
      isActive: status.isActive,
    };
  });

  await prisma.$transaction(async (tx) => {
    if (removed.length > 0) {
      await tx.shipmentStatusDef.deleteMany({
        where: { id: { in: removed.map((d) => d.id) } },
      });
    }
    for (const row of rows) {
      const { id, ...data } = row;
      if (id) {
        await tx.shipmentStatusDef.update({ where: { id }, data });
      } else {
        await tx.shipmentStatusDef.create({ data });
      }
    }
  });

  return prisma.shipmentStatusDef.findMany({ orderBy: { sortOrder: "asc" } });
}
