import { z } from "zod";

export const addTrackingEventSchema = z.object({
  status: z.string().min(1),
  location: z.string().min(1),
  description: z.string().optional(),
  branchId: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
});

export type AddTrackingEventInput = z.infer<typeof addTrackingEventSchema>;
