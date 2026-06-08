import { ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canTransitionStatus } from "@/lib/shipment-status";
import type { AddTrackingEventInput } from "@/lib/validators/tracking";
import { getShipmentById } from "./shipment.service";
import type { Role } from "@prisma/client";
import { logActivity } from "./activity.service";

export class InvalidStatusTransitionError extends Error {
  constructor(from: ShipmentStatus, to: ShipmentStatus) {
    super(`Invalid status transition from ${from} to ${to}`);
    this.name = "InvalidStatusTransitionError";
  }
}

export async function addTrackingEvent(
  shipmentId: string,
  input: AddTrackingEventInput,
  userId: string,
  actor: { role: Role; branchId?: string | null },
) {
  const shipment = await getShipmentById(shipmentId, actor);
  if (!shipment) return null;

  if (!canTransitionStatus(shipment.status, input.status)) {
    throw new InvalidStatusTransitionError(shipment.status, input.status);
  }

  const result = await prisma.$transaction(async (tx) => {
    const event = await tx.trackingHistory.create({
      data: {
        shipmentId,
        status: input.status,
        location: input.location,
        description: input.description,
        branchId: input.branchId,
        updatedById: userId,
      },
      include: {
        branch: { select: { id: true, name: true, city: true } },
        updatedBy: { select: { id: true, name: true } },
      },
    });

    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        status: input.status,
        currentLocation: input.location,
        ...(input.estimatedDelivery && {
          estimatedDelivery: new Date(input.estimatedDelivery),
        }),
        ...(input.status === ShipmentStatus.DELIVERED && {
          actualDelivery: new Date(),
        }),
      },
      include: {
        customer: { select: { id: true, code: true, name: true } },
        trackingHistory: {
          orderBy: { timestamp: "asc" },
          include: { branch: { select: { id: true, name: true, city: true } } },
        },
      },
    });

    return { event, shipment: updatedShipment };
  });

  await logActivity({
    type: "TRACKING_ADDED",
    message: `Tracking update for ${result.shipment.trackingNumber}: ${input.status}`,
    userId,
    entityType: "Shipment",
    entityId: shipmentId,
    metadata: { status: input.status, location: input.location },
  });

  return result;
}

export async function getPublicTracking(trackingNumber: string) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: trackingNumber.toUpperCase() },
    select: {
      trackingNumber: true,
      status: true,
      serviceOffering: { select: { name: true } },
      senderCity: true,
      recipientCity: true,
      currentLocation: true,
      estimatedDelivery: true,
      actualDelivery: true,
      createdAt: true,
      trackingHistory: {
        orderBy: { timestamp: "asc" },
        select: {
          id: true,
          status: true,
          location: true,
          description: true,
          timestamp: true,
          branch: { select: { name: true, city: true } },
        },
      },
    },
  });

  return shipment;
}
