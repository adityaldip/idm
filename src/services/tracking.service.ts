import { prisma } from "@/lib/prisma";
import { canTransitionStatus } from "@/lib/shipment-status";
import { listShipmentStatuses } from "./shipment-status.service";
import type { AddTrackingEventInput } from "@/lib/validators/tracking";
import type { SavedTrackingPhoto } from "@/lib/tracking-photo-store";
import { getShipmentById } from "./shipment.service";
import type { Role } from "@prisma/client";
import { logActivity } from "./activity.service";

export class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export class UnknownStatusError extends Error {
  constructor(code: string) {
    super(`Unknown shipment status "${code}"`);
    this.name = "UnknownStatusError";
  }
}

export async function addTrackingEvent(
  shipmentId: string,
  input: AddTrackingEventInput,
  userId: string,
  actor: { role: Role; branchId?: string | null },
  photos: Omit<SavedTrackingPhoto, "absolutePath">[] = [],
) {
  const shipment = await getShipmentById(shipmentId, actor);
  if (!shipment) return null;

  const defs = await listShipmentStatuses();
  const target = defs.find((def) => def.code === input.status);
  if (!target) throw new UnknownStatusError(input.status);

  if (!canTransitionStatus(shipment.statusId, target.id, defs)) {
    throw new InvalidStatusTransitionError(shipment.status.label, target.label);
  }

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.trackingHistory.create({
      data: {
        shipmentId,
        statusId: target.id,
        location: input.location,
        description: input.description,
        branchId: input.branchId,
        updatedById: userId,
        ...(photos.length > 0 && {
          photos: {
            create: photos.map((photo) => ({
              url: photo.url,
              width: photo.width,
              height: photo.height,
              sizeBytes: photo.sizeBytes,
              sortOrder: photo.sortOrder,
            })),
          },
        }),
      },
      include: {
        branch: { select: { id: true, name: true, city: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });

    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        statusId: target.id,
        currentLocation: input.location,
        ...(input.estimatedDelivery && {
          estimatedDelivery: new Date(input.estimatedDelivery),
        }),
        ...(target.isFinal &&
          !target.allowFromAny && { actualDelivery: new Date() }),
      },
      include: {
        status: true,
        customer: { select: { id: true, code: true, name: true } },
        trackingHistory: {
          orderBy: { timestamp: "asc" },
          include: {
            branch: { select: { id: true, name: true, city: true } },
            photos: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    return { event, shipment: updatedShipment };
  });

  await logActivity({
    type: "TRACKING_ADDED",
    message: `Tracking update for ${result.shipment.trackingNumber}: ${target.label}`,
    userId,
    entityType: "Shipment",
    entityId: shipmentId,
    metadata: { status: target.code, location: input.location },
  });

  return result;
}

export async function getPublicTracking(trackingNumber: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: trackingNumber.toUpperCase() },
    select: {
      trackingNumber: true,
      poNumber: true,
      status: true,
      statusId: true,
      serviceOffering: { select: { name: true, icon: true } },
      senderCity: true,
      recipientCity: true,
      currentLocation: true,
      estimatedDelivery: true,
      actualDelivery: true,
      createdAt: true,
      driver: { select: { name: true } },
      vehicle: { select: { plateNumber: true } },
      trackingHistory: {
        orderBy: { timestamp: "asc" },
        select: {
          id: true,
          status: true,
          location: true,
          description: true,
          timestamp: true,
          branch: { select: { name: true, city: true } },
          photos: {
            orderBy: { sortOrder: "asc" },
            select: { id: true, url: true, width: true, height: true },
          },
        },
      },
    },
  });

  return shipment;
}

/**
 * Public lookup accepting either a tracking number or a customer PO number.
 * Tracking numbers are unique so they win; PO numbers are not, so a code that
 * only matches PO numbers can return several shipments for the visitor to pick.
 */
const trackingMatchSelect = {
  trackingNumber: true,
  poNumber: true,
  status: true,
  senderCity: true,
  recipientCity: true,
  createdAt: true,
} as const;

export type PublicTrackingMatch = {
  trackingNumber: string;
  poNumber: string | null;
  status: { code: string; label: string; color: string };
  senderCity: string;
  recipientCity: string;
  createdAt: Date;
};

export async function findPublicTrackingMatches(
  code: string,
): Promise<PublicTrackingMatch[]> {
  const trimmed = code.trim();
  if (!trimmed) return [];

  const byTrackingNumber = await prisma.shipment.findUnique({
    where: { trackingNumber: trimmed.toUpperCase() },
    select: trackingMatchSelect,
  });
  if (byTrackingNumber) return [byTrackingNumber];

  return prisma.shipment.findMany({
    where: { poNumber: { equals: trimmed, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    select: trackingMatchSelect,
  });
}
