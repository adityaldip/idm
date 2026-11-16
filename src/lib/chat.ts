export const CHAT_COOKIE = "idm_chat";
export const CHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds
export const CHAT_MESSAGE_MAX_LENGTH = 2000;
export const CHAT_BOT_NAME = "IDM Assistant";

/** "+62 812-3456-7890", "62812..." and "0812 3456 7890" all become "081234567890". */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
}

/** wa.me wants the international form without "+": 0812... → 62812... */
export function whatsappNumber(phone: string): string {
  const normalized = normalizePhone(phone);
  return normalized.startsWith("0") ? `62${normalized.slice(1)}` : normalized;
}

// --- Settings ---------------------------------------------------------------

export type ChatQuickReply = { label: string; action: "track" | "text" };

export type ChatHours = {
  /** 0 = Minggu … 6 = Sabtu */
  days: number[];
  open: string; // "HH:MM", WIB
  close: string; // "HH:MM", WIB
};

export type ChatSettings = {
  enabled: boolean;
  welcome: string;
  welcomeOffline: string;
  hours: ChatHours;
  quickReplies: ChatQuickReply[];
};

export const CHAT_SETTING_KEYS = {
  enabled: "chat_enabled",
  welcome: "chat_welcome",
  welcomeOffline: "chat_welcome_offline",
  hours: "chat_hours",
  quickReplies: "chat_quick_replies",
} as const satisfies Record<keyof ChatSettings, string>;

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  enabled: true,
  welcome:
    "Halo {nama}, selamat datang di PT Intan Daya Mandiri. Pesan kamu sudah kami terima dan CS kami akan segera membalas.\n\nSambil menunggu, ada yang bisa kami bantu?",
  welcomeOffline:
    "Halo {nama}, terima kasih sudah menghubungi PT Intan Daya Mandiri. CS kami sedang offline dan akan membalas pada jam kerja ({jam_kerja}).",
  hours: { days: [1, 2, 3, 4, 5, 6], open: "08:00", close: "17:00" },
  quickReplies: [{ label: "Cek status resi", action: "track" }],
};

function parseJson<T>(value: string | undefined, isValid: (v: unknown) => v is T, fallback: T): T {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isChatHours(v: unknown): v is ChatHours {
  if (!v || typeof v !== "object") return false;
  const h = v as Record<string, unknown>;
  return (
    Array.isArray(h.days) &&
    h.days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6) &&
    typeof h.open === "string" &&
    TIME_PATTERN.test(h.open) &&
    typeof h.close === "string" &&
    TIME_PATTERN.test(h.close)
  );
}

function isQuickReplies(v: unknown): v is ChatQuickReply[] {
  return (
    Array.isArray(v) &&
    v.every(
      (q) =>
        q &&
        typeof q === "object" &&
        typeof (q as ChatQuickReply).label === "string" &&
        ((q as ChatQuickReply).action === "track" || (q as ChatQuickReply).action === "text"),
    )
  );
}

/** Missing or malformed rows fall back to defaults, so chat works before anyone saves settings. */
export function parseChatSettings(rows: Record<string, string | undefined>): ChatSettings {
  const d = DEFAULT_CHAT_SETTINGS;
  const enabled = rows[CHAT_SETTING_KEYS.enabled];
  return {
    enabled: enabled === undefined ? d.enabled : enabled === "true",
    welcome: rows[CHAT_SETTING_KEYS.welcome]?.trim() || d.welcome,
    welcomeOffline: rows[CHAT_SETTING_KEYS.welcomeOffline]?.trim() || d.welcomeOffline,
    hours: parseJson(rows[CHAT_SETTING_KEYS.hours], isChatHours, d.hours),
    quickReplies: parseJson(rows[CHAT_SETTING_KEYS.quickReplies], isQuickReplies, d.quickReplies),
  };
}

export function serializeChatSettings(settings: ChatSettings): Record<string, string> {
  return {
    [CHAT_SETTING_KEYS.enabled]: String(settings.enabled),
    [CHAT_SETTING_KEYS.welcome]: settings.welcome,
    [CHAT_SETTING_KEYS.welcomeOffline]: settings.welcomeOffline,
    [CHAT_SETTING_KEYS.hours]: JSON.stringify(settings.hours),
    [CHAT_SETTING_KEYS.quickReplies]: JSON.stringify(settings.quickReplies),
  };
}

// --- Working hours (always WIB, whatever the server's timezone) ---------------

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function minutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isWithinWorkingHours(hours: ChatHours, now: Date = new Date()): boolean {
  const wib = new Date(now.getTime() + WIB_OFFSET_MS);
  if (!hours.days.includes(wib.getUTCDay())) return false;
  const current = wib.getUTCHours() * 60 + wib.getUTCMinutes();
  return current >= minutes(hours.open) && current < minutes(hours.close);
}

/** "Senin–Sabtu, 08.00–17.00 WIB"; non-consecutive days are listed. */
export function formatWorkingHours(hours: ChatHours): string {
  const days = [...new Set(hours.days)].sort((a, b) => a - b);
  const consecutive = days.every((d, i) => i === 0 || d === days[i - 1] + 1);
  const dayText =
    days.length === 0
      ? "-"
      : days.length === 1
        ? DAY_NAMES[days[0]]
        : consecutive
          ? `${DAY_NAMES[days[0]]}–${DAY_NAMES[days[days.length - 1]]}`
          : days.map((d) => DAY_NAMES[d]).join(", ");
  const time = (t: string) => t.replace(":", ".");
  return `${dayText}, ${time(hours.open)}–${time(hours.close)} WIB`;
}

export function renderChatTemplate(template: string, vars: { nama: string; jam_kerja: string }): string {
  return template.replace(/\{(nama|jam_kerja)\}/g, (_, key: keyof typeof vars) => vars[key]);
}

export function welcomeMessage(settings: ChatSettings, visitorName: string, now: Date = new Date()): string {
  const template = isWithinWorkingHours(settings.hours, now) ? settings.welcome : settings.welcomeOffline;
  return renderChatTemplate(template, {
    nama: visitorName.trim().split(/\s+/)[0] ?? visitorName,
    jam_kerja: formatWorkingHours(settings.hours),
  });
}

// --- Tracking-number bot -------------------------------------------------------

const TRACKING_NUMBER_PATTERN = /\bIDM\d{6,}\b/i;
/** A field that holds only a tracking number. */
export const TRACKING_NUMBER_FORMAT = /^IDM\d{6,20}$/i;

export function extractTrackingNumber(text: string): string | null {
  return text.match(TRACKING_NUMBER_PATTERN)?.[0].toUpperCase() ?? null;
}

export type TrackingReplyInput = {
  trackingNumber: string;
  statusLabel: string;
  currentLocation: string | null;
  lastUpdate: Date | null;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
};

const wibDateTime = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const wibDate = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatTrackingReply(input: TrackingReplyInput): string {
  const lines = [`Status resi ${input.trackingNumber}: ${input.statusLabel}`];
  if (input.currentLocation) lines.push(`Lokasi terakhir: ${input.currentLocation}`);
  if (input.lastUpdate) lines.push(`Update terakhir: ${wibDateTime.format(input.lastUpdate)} WIB`);
  if (input.actualDelivery) {
    lines.push(`Diterima: ${wibDate.format(input.actualDelivery)}`);
  } else if (input.estimatedDelivery) {
    lines.push(`Estimasi tiba: ${wibDate.format(input.estimatedDelivery)}`);
  }
  lines.push("", `Detail perjalanan: /tracking/${input.trackingNumber}`);
  lines.push("Kalau masih ada pertanyaan, tulis saja di sini dan CS kami akan membalas.");
  return lines.join("\n");
}

export const BOT_ASK_TRACKING =
  "Silakan kirim nomor resi kamu (contoh: IDM2026000017), nanti langsung kami cek statusnya.";

export function botTrackingNotFound(trackingNumber: string): string {
  return `Resi ${trackingNumber} tidak ditemukan. Pastikan nomornya benar, atau tunggu sebentar, CS kami akan membantu.`;
}
