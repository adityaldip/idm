import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";
import { paginationSchema } from "./common";

export const shipmentListSchema = paginationSchema.extend({
  status: z.nativeEnum(ShipmentStatus).optional(),
  branchId: z.string().optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const createShipmentSchema = z.object({
  customerId: z.string().min(1),
  serviceOfferingId: z.string().min(1),
  senderName: z.string().min(1),
  senderPhone: z.string().min(1),
  senderAddress: z.string().min(1),
  senderCity: z.string().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(1),
  recipientAddress: z.string().min(1),
  recipientCity: z.string().min(1),
  originBranchId: z.string().optional(),
  destinationBranchId: z.string().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  packageCount: z.number().int().positive().default(1),
  description: z.string().optional(),
  declaredValue: z.number().nonnegative().optional(),
  shippingCost: z.number().nonnegative().optional(),
  insuranceCost: z.number().nonnegative().optional(),
  totalCost: z.number().nonnegative().optional(),
  estimatedDelivery: z.string().datetime().optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateShipmentSchema = createShipmentSchema
  .partial()
  .extend({
    status: z.nativeEnum(ShipmentStatus).optional(),
    currentLocation: z.string().optional(),
    actualDelivery: z.string().datetime().optional(),
    vehicleId: z.string().nullable().optional(),
    driverId: z.string().nullable().optional(),
  });

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
