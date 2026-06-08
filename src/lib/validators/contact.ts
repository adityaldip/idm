import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
