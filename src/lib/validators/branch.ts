import { z } from "zod";
import { paginationSchema } from "./common";

export const branchListSchema = paginationSchema;

export const createBranchSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().optional(),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isHeadquarters: z.boolean().optional(),
});

export const updateBranchSchema = createBranchSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
