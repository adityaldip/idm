import { z } from "zod";
import { STATUS_COLORS } from "@/lib/shipment-status";

export const shipmentStatusRowSchema = z.object({
  id: z.string().optional(),
  code: z.string().max(40).optional(),
  label: z.string().min(1).max(60),
  color: z.enum(STATUS_COLORS as [string, ...string[]]),
  isFinal: z.boolean(),
  allowFromAny: z.boolean(),
  isActive: z.boolean(),
});

export const saveShipmentStatusesSchema = z
  .object({
    statuses: z.array(shipmentStatusRowSchema).min(1).max(30),
    initialIndex: z.number().int().nonnegative(),
  })
  .refine((v) => v.initialIndex < v.statuses.length, {
    message: "Status awal harus salah satu status di daftar",
    path: ["initialIndex"],
  })
  .refine(
    (v) => {
      const initial = v.statuses[v.initialIndex];
      return initial?.isActive && !initial.allowFromAny;
    },
    {
      message: "Status awal harus aktif dan bukan status pengecualian",
      path: ["initialIndex"],
    },
  );

export type SaveShipmentStatusesInput = z.infer<typeof saveShipmentStatusesSchema>;
export type ShipmentStatusRowInput = z.infer<typeof shipmentStatusRowSchema>;
