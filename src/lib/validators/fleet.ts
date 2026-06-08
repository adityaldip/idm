import { z } from "zod";
import { DriverStatus, VehicleStatus, VehicleType } from "@prisma/client";
import { paginationSchema } from "./common";

export const vehicleListSchema = paginationSchema.extend({
  status: z.nativeEnum(VehicleStatus).optional(),
  branchId: z.string().optional(),
});

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(1),
  type: z.nativeEnum(VehicleType),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().optional(),
  capacity: z.number().positive().optional(),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
  branchId: z.string().optional(),
  lastServiceAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const driverListSchema = paginationSchema.extend({
  status: z.nativeEnum(DriverStatus).optional(),
});

export const createDriverSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.string().optional(),
  status: z.nativeEnum(DriverStatus).default(DriverStatus.ACTIVE),
  vehicleId: z.string().optional(),
  photoUrl: z.string().optional(),
});

export const updateDriverSchema = createDriverSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
