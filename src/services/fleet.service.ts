import type { DriverStatus, Prisma, VehicleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type { PaginationInput } from "@/lib/validators/common";
import type {
  CreateDriverInput,
  CreateVehicleInput,
} from "@/lib/validators/fleet";

type VehicleFilters = PaginationInput & {
  status?: VehicleStatus;
  branchId?: string;
};

type DriverFilters = PaginationInput & {
  status?: DriverStatus;
};

export async function listFleetForAssignment() {
  const [drivers, vehicles] = await Promise.all([
    prisma.driver.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        vehicleId: true,
        vehicle: { select: { plateNumber: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: { status: { in: ["AVAILABLE", "IN_USE"] } },
      orderBy: { plateNumber: "asc" },
      select: { id: true, plateNumber: true, type: true },
    }),
  ]);

  return { drivers, vehicles };
}

export async function listVehicles(filters: VehicleFilters) {
  const { page, limit, search, sortOrder, status, branchId } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.VehicleWhereInput = {
    ...(status && { status }),
    ...(branchId && { branchId }),
    ...(search
      ? {
          OR: [
            { plateNumber: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
      include: {
        branch: { select: { id: true, name: true, city: true } },
        _count: { select: { drivers: true, shipments: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      branch: true,
      drivers: true,
    },
  });
}

export async function createVehicle(input: CreateVehicleInput) {
  return prisma.vehicle.create({
    data: {
      ...input,
      lastServiceAt: input.lastServiceAt
        ? new Date(input.lastServiceAt)
        : undefined,
    },
  });
}

export async function updateVehicle(
  id: string,
  input: Partial<CreateVehicleInput>,
) {
  return prisma.vehicle.update({
    where: { id },
    data: {
      ...input,
      lastServiceAt: input.lastServiceAt
        ? new Date(input.lastServiceAt)
        : undefined,
    },
  });
}

export async function deleteVehicle(id: string) {
  const shipmentCount = await prisma.shipment.count({ where: { vehicleId: id } });
  if (shipmentCount > 0) {
    throw new Error("Cannot delete vehicle assigned to shipments");
  }
  await prisma.vehicle.delete({ where: { id } });
  return true;
}

export async function listDrivers(filters: DriverFilters) {
  const { page, limit, search, sortOrder, status } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.DriverWhereInput = {
    ...(status && { status }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { code: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { licenseNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
      include: {
        vehicle: { select: { id: true, plateNumber: true, type: true } },
        _count: { select: { shipments: true } },
      },
    }),
    prisma.driver.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function getDriverById(id: string) {
  return prisma.driver.findUnique({
    where: { id },
    include: { vehicle: true },
  });
}

export async function createDriver(input: CreateDriverInput) {
  return prisma.driver.create({
    data: {
      ...input,
      licenseExpiry: input.licenseExpiry
        ? new Date(input.licenseExpiry)
        : undefined,
    },
  });
}

export async function updateDriver(
  id: string,
  input: Partial<CreateDriverInput>,
) {
  return prisma.driver.update({
    where: { id },
    data: {
      ...input,
      licenseExpiry: input.licenseExpiry
        ? new Date(input.licenseExpiry)
        : undefined,
    },
  });
}

export async function deleteDriver(id: string) {
  const shipmentCount = await prisma.shipment.count({ where: { driverId: id } });
  if (shipmentCount > 0) {
    throw new Error("Cannot delete driver assigned to shipments");
  }
  await prisma.driver.delete({ where: { id } });
  return true;
}
