import { z } from "zod";
import { ShipmentStatus } from "@prisma/client";

export const addTrackingEventSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  location: z.string().min(1),
  description: z.string().optional(),
  branchId: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
});

export type AddTrackingEventInput = z.infer<typeof addTrackingEventSchema>;
