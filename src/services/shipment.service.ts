import type { Prisma, Role } from "@prisma/client";
import { ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type {
  CreateShipmentInput,
  UpdateShipmentInput,
} from "@/lib/validators/shipment";
import type { PaginationInput } from "@/lib/validators/common";
import { logActivity } from "./activity.service";

type ShipmentFilters = PaginationInput & {
  status?: ShipmentStatus;
  branchId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
};

function branchScopeWhere(
  role: Role,
  userBranchId?: string | null,
): Prisma.ShipmentWhereInput | undefined {
  if (role !== "OPERATOR" || !userBranchId) return undefined;
  return {
    OR: [
      { originBranchId: userBranchId },
      { destinationBranchId: userBranchId },
    ],
  };
}

export async function generateTrackingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `IDM${year}`;

  const latest = await prisma.shipment.findFirst({
    where: { trackingNumber: { startsWith: prefix } },
    orderBy: { trackingNumber: "desc" },
    select: { trackingNumber: true },
  });

  const lastSeq = latest
    ? parseInt(latest.trackingNumber.slice(prefix.length), 10)
    : 0;

  return `${prefix}${String(lastSeq + 1).padStart(6, "0")}`;
}

const shipmentInclude = {
  serviceOffering: { select: { id: true, slug: true, name: true } },
  customer: { select: { id: true, code: true, name: true, phone: true } },
  originBranch: { select: { id: true, code: true, name: true, city: true } },
  destinationBranch: {
    select: { id: true, code: true, name: true, city: true },
  },
  vehicle: { select: { id: true, plateNumber: true, type: true } },
  driver: { select: { id: true, code: true, name: true, phone: true } },
  createdBy: { select: { id: true, name: true } },
  trackingHistory: {
    orderBy: { timestamp: "asc" as const },
    include: { branch: { select: { id: true, name: true, city: true } } },
  },
};

export async function listShipments(
  filters: ShipmentFilters,
  actor: { role: Role; branchId?: string | null },
) {
  const { page, limit, search, sortBy, sortOrder, status, branchId, customerId, dateFrom, dateTo } =
    filters;
  const skip = (page - 1) * limit;

  const where: Prisma.ShipmentWhereInput = {
    ...branchScopeWhere(actor.role, actor.branchId),
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...(branchId && {
      OR: [{ originBranchId: branchId }, { destinationBranchId: branchId }],
    }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: new Date(dateFrom) }),
            ...(dateTo && { lte: new Date(dateTo) }),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { trackingNumber: { contains: search, mode: "insensitive" } },
            { senderName: { contains: search, mode: "insensitive" } },
            { recipientName: { contains: search, mode: "insensitive" } },
            { senderCity: { contains: search, mode: "insensitive" } },
            { recipientCity: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ShipmentOrderByWithRelationInput =
    sortBy === "trackingNumber"
      ? { trackingNumber: sortOrder }
      : sortBy === "status"
        ? { status: sortOrder }
        : { createdAt: sortOrder };

  const [items, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        serviceOffering: { select: { id: true, name: true } },
        customer: { select: { id: true, code: true, name: true } },
        originBranch: { select: { id: true, name: true, city: true } },
        destinationBranch: { select: { id: true, name: true, city: true } },
        vehicle: { select: { id: true, plateNumber: true } },
        driver: { select: { id: true, code: true, name: true } },
      },
    }),
    prisma.shipment.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function getShipmentById(
  id: string,
  actor: { role: Role; branchId?: string | null },
) {
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: shipmentInclude,
  });

  if (!shipment) return null;

  if (actor.role === "OPERATOR" && actor.branchId) {
    const inScope =
      shipment.originBranchId === actor.branchId ||
      shipment.destinationBranchId === actor.branchId;
    if (!inScope) return null;
  }

  return shipment;
}

export async function getShipmentByTrackingNumber(trackingNumber: string) {
  return prisma.shipment.findUnique({
    where: { trackingNumber: trackingNumber.toUpperCase() },
    include: shipmentInclude,
  });
}

export async function createShipment(
  input: CreateShipmentInput,
  userId: string,
) {
  const trackingNumber = await generateTrackingNumber();

  const shipment = await prisma.$transaction(async (tx) => {
    const created = await tx.shipment.create({
      data: {
        trackingNumber,
        status: ShipmentStatus.CREATED,
        serviceOfferingId: input.serviceOfferingId,
        customerId: input.customerId,
        senderName: input.senderName,
        senderPhone: input.senderPhone,
        senderAddress: input.senderAddress,
        senderCity: input.senderCity,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        recipientAddress: input.recipientAddress,
        recipientCity: input.recipientCity,
        originBranchId: input.originBranchId,
        destinationBranchId: input.destinationBranchId,
        weight: input.weight,
        dimensions: input.dimensions,
        packageCount: input.packageCount,
        description: input.description,
        declaredValue: input.declaredValue,
        shippingCost: input.shippingCost,
        insuranceCost: input.insuranceCost,
        totalCost: input.totalCost,
        estimatedDelivery: input.estimatedDelivery
          ? new Date(input.estimatedDelivery)
          : undefined,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        notes: input.notes,
        currentLocation: input.senderCity,
        createdById: userId,
      },
      include: shipmentInclude,
    });

    await tx.trackingHistory.create({
      data: {
        shipmentId: created.id,
        status: ShipmentStatus.CREATED,
        location: input.senderCity,
        description: "Shipment created",
        branchId: input.originBranchId,
        updatedById: userId,
      },
    });

    return created;
  });

  await logActivity({
    type: "SHIPMENT_CREATED",
    message: `Shipment ${shipment.trackingNumber} created`,
    userId,
    entityType: "Shipment",
    entityId: shipment.id,
  });

  return shipment;
}

export async function updateShipment(
  id: string,
  input: UpdateShipmentInput,
  userId: string,
  actor: { role: Role; branchId?: string | null },
) {
  const existing = await getShipmentById(id, actor);
  if (!existing) return null;

  const {
    estimatedDelivery,
    actualDelivery,
    originBranchId,
    destinationBranchId,
    vehicleId,
    driverId,
    ...rest
  } = input;

  const shipment = await prisma.shipment.update({
    where: { id },
    data: {
      ...rest,
      ...(originBranchId !== undefined && {
        originBranchId: originBranchId || null,
      }),
      ...(destinationBranchId !== undefined && {
        destinationBranchId: destinationBranchId || null,
      }),
      ...(vehicleId !== undefined && { vehicleId: vehicleId || null }),
      ...(driverId !== undefined && { driverId: driverId || null }),
      ...(estimatedDelivery !== undefined && {
        estimatedDelivery: estimatedDelivery
          ? new Date(estimatedDelivery)
          : null,
      }),
      ...(actualDelivery !== undefined && {
        actualDelivery: actualDelivery ? new Date(actualDelivery) : null,
      }),
    },
    include: shipmentInclude,
  });

  await logActivity({
    type: "SHIPMENT_UPDATED",
    message: `Shipment ${shipment.trackingNumber} updated`,
    userId,
    entityType: "Shipment",
    entityId: shipment.id,
  });

  return shipment;
}

export async function deleteShipment(
  id: string,
  actor: { role: Role; branchId?: string | null },
) {
  const existing = await getShipmentById(id, actor);
  if (!existing) return false;

  await prisma.shipment.delete({ where: { id } });
  return true;
}
