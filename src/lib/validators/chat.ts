import { z } from "zod";
import { CHAT_MESSAGE_MAX_LENGTH, TRACKING_NUMBER_FORMAT } from "@/lib/chat";

export const startChatSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s().]{8,20}$/, "Nomor HP tidak valid"),
  email: z.string().trim().email("Email tidak valid").optional().or(z.literal("")),
  trackingNumber: z
    .string()
    .trim()
    .regex(TRACKING_NUMBER_FORMAT, "Format resi tidak valid (contoh: IDM2026000017)")
    .optional()
    .or(z.literal("")),
  /** Honeypot: hidden field that real visitors leave empty. */
  website: z.string().max(0).optional(),
});

export type StartChatInput = z.infer<typeof startChatSchema>;

export const chatMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Pesan kosong")
    .max(CHAT_MESSAGE_MAX_LENGTH, `Pesan maksimal ${CHAT_MESSAGE_MAX_LENGTH} karakter`),
});

export const quickReplySchema = z.object({
  index: z.number().int().min(0).max(19),
});

export const chatAfterSchema = z.object({
  after: z.coerce.number().int().min(0).default(0),
  read: z.enum(["0", "1"]).default("1"),
});

export const chatListSchema = z.object({
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
});

/** `null` unassigns / unlinks; omitted fields are left unchanged. */
export const updateConversationSchema = z
  .object({
    status: z.enum(["OPEN", "CLOSED"]).optional(),
    assignedToId: z.string().min(1).nullable().optional(),
    customerId: z.string().min(1).nullable().optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), { message: "Tidak ada perubahan" });

export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:MM");

export const chatSettingsSchema = z
  .object({
    enabled: z.boolean(),
    welcome: z.string().trim().min(1, "Pesan sambutan wajib diisi").max(1000),
    welcomeOffline: z.string().trim().min(1, "Pesan di luar jam kerja wajib diisi").max(1000),
    hours: z.object({
      days: z.array(z.number().int().min(0).max(6)).min(1, "Pilih minimal satu hari kerja"),
      open: timeSchema,
      close: timeSchema,
    }),
    quickReplies: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Label tombol wajib diisi").max(40),
          action: z.enum(["track", "text"]),
        }),
      )
      .max(6, "Maksimal 6 tombol"),
  })
  .refine((s) => s.hours.open < s.hours.close, {
    message: "Jam tutup harus setelah jam buka",
    path: ["hours", "close"],
  });
