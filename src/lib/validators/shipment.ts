import { z } from "zod";
import { ItemUnit } from "@prisma/client";
import { paginationSchema } from "./common";

export const shipmentItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.nativeEnum(ItemUnit),
  weightKg: z.number().nonnegative().optional(),
  volumeM3: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

export const shipmentListSchema = paginationSchema.extend({
  status: z.string().optional(),
  branchId: z.string().optional(),
  customerId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const createShipmentSchema = z.object({
  customerId: z.string().min(1),
  poNumber: z.string().max(50).optional(),
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
  items: z.array(shipmentItemSchema).max(100).optional(),
});

export const updateShipmentSchema = createShipmentSchema
  .partial()
  .extend({
    status: z.string().optional(),
    currentLocation: z.string().optional(),
    actualDelivery: z.string().datetime().optional(),
    vehicleId: z.string().nullable().optional(),
    driverId: z.string().nullable().optional(),
  });

export type ShipmentItemInput = z.infer<typeof shipmentItemSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
