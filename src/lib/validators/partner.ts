import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  website: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});
