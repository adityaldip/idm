import { startChatSchema } from "@/lib/validators/chat";
import { describe, it, expect } from "vitest";
import {
  CHAT_SETTING_KEYS,
  DEFAULT_CHAT_SETTINGS,
  extractTrackingNumber,
  formatTrackingReply,
  formatWorkingHours,
  isWithinWorkingHours,
  normalizePhone,
  parseChatSettings,
  renderChatTemplate,
  serializeChatSettings,
  welcomeMessage,
  whatsappNumber,
} from "@/lib/chat";
import { generateChatToken, hashChatToken } from "@/lib/chat-token";

// Times are given in UTC; WIB = UTC+7.
const wib = (iso: string) => new Date(`${iso}+07:00`);

describe("chat tokens", () => {
  it("generates distinct url-safe tokens", () => {
    const a = generateChatToken();
    const b = generateChatToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("hashes deterministically without returning the token", () => {
    const token = generateChatToken();
    expect(hashChatToken(token)).toBe(hashChatToken(token));
    expect(hashChatToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashChatToken(token)).not.toContain(token);
  });
});

describe("phone numbers", () => {
  it("normalizes local and international formats to the same value", () => {
    expect(normalizePhone("0812 3456 7890")).toBe("081234567890");
    expect(normalizePhone("+62 812-3456-7890")).toBe("081234567890");
    expect(normalizePhone("6281234567890")).toBe("081234567890");
  });

  it("builds a wa.me number", () => {
    expect(whatsappNumber("0812-3456-7890")).toBe("6281234567890");
  });
});

describe("working hours (WIB)", () => {
  const hours = { days: [1, 2, 3, 4, 5, 6], open: "08:00", close: "17:00" };

  it("is open inside the window on a working day", () => {
    expect(isWithinWorkingHours(hours, wib("2026-11-13T08:00:00"))).toBe(true); // Jumat
    expect(isWithinWorkingHours(hours, wib("2026-11-13T16:59:00"))).toBe(true);
  });

  it("is closed at closing time, before opening, and on Sunday", () => {
    expect(isWithinWorkingHours(hours, wib("2026-11-13T17:00:00"))).toBe(false);
    expect(isWithinWorkingHours(hours, wib("2026-11-13T07:59:00"))).toBe(false);
    expect(isWithinWorkingHours(hours, wib("2026-11-15T10:00:00"))).toBe(false); // Minggu
  });

  it("uses WIB even when the UTC date is a different day", () => {
    // Sabtu 05:00 WIB is Jumat 22:00 UTC.
    expect(isWithinWorkingHours({ ...hours, open: "04:00" }, wib("2026-11-14T05:00:00"))).toBe(true);
  });

  it("formats day ranges and lists", () => {
    expect(formatWorkingHours(hours)).toBe("Senin–Sabtu, 08.00–17.00 WIB");
    expect(formatWorkingHours({ ...hours, days: [1, 3, 5] })).toBe("Senin, Rabu, Jumat, 08.00–17.00 WIB");
    expect(formatWorkingHours({ ...hours, days: [6] })).toBe("Sabtu, 08.00–17.00 WIB");
  });
});

describe("welcome message", () => {
  it("replaces template variables", () => {
    expect(renderChatTemplate("Halo {nama}, jam {jam_kerja}. {lain}", { nama: "Budi", jam_kerja: "X" })).toBe(
      "Halo Budi, jam X. {lain}",
    );
  });

  it("uses the first name and picks the online/offline text", () => {
    const online = welcomeMessage(DEFAULT_CHAT_SETTINGS, "Budi Santoso", wib("2026-11-13T10:00:00"));
    const offline = welcomeMessage(DEFAULT_CHAT_SETTINGS, "Budi Santoso", wib("2026-11-13T21:00:00"));
    expect(online).toMatch(/^Halo Budi, selamat datang/);
    expect(offline).toContain("CS kami sedang offline");
    expect(offline).toContain("Senin–Sabtu, 08.00–17.00 WIB");
  });
});

describe("chat settings", () => {
  it("falls back to defaults when rows are missing", () => {
    expect(parseChatSettings({})).toEqual(DEFAULT_CHAT_SETTINGS);
  });

  it("round-trips through serialize/parse", () => {
    const custom = {
      ...DEFAULT_CHAT_SETTINGS,
      enabled: false,
      hours: { days: [1, 2], open: "09:30", close: "15:00" },
      quickReplies: [{ label: "Cek resi", action: "track" as const }],
    };
    expect(parseChatSettings(serializeChatSettings(custom))).toEqual(custom);
  });

  it("ignores malformed JSON values", () => {
    const parsed = parseChatSettings({
      [CHAT_SETTING_KEYS.hours]: '{"days":[9],"open":"8","close":"x"}',
      [CHAT_SETTING_KEYS.quickReplies]: "not json",
    });
    expect(parsed.hours).toEqual(DEFAULT_CHAT_SETTINGS.hours);
    expect(parsed.quickReplies).toEqual(DEFAULT_CHAT_SETTINGS.quickReplies);
  });
});

describe("tracking bot", () => {
  it("extracts a tracking number from free text", () => {
    expect(extractTrackingNumber("resi saya idm2026000017 ya")).toBe("IDM2026000017");
    expect(extractTrackingNumber("belum ada resi")).toBeNull();
    expect(extractTrackingNumber("IDM12")).toBeNull();
  });

  it("formats a reply with ETA and the tracking link", () => {
    const reply = formatTrackingReply({
      trackingNumber: "IDM2026000017",
      statusLabel: "In Transit",
      currentLocation: "Surabaya",
      lastUpdate: new Date("2026-11-13T03:04:00Z"),
      estimatedDelivery: new Date("2026-11-14T00:00:00Z"),
      actualDelivery: null,
    });
    expect(reply).toContain("Status resi IDM2026000017: In Transit");
    expect(reply).toContain("Lokasi terakhir: Surabaya");
    expect(reply).toContain("10.04");
    expect(reply).toContain("Estimasi tiba: 14 November 2026");
    expect(reply).toContain("/tracking/IDM2026000017");
  });

  it("shows the delivery date instead of the ETA once delivered", () => {
    const reply = formatTrackingReply({
      trackingNumber: "IDM1",
      statusLabel: "Delivered",
      currentLocation: null,
      lastUpdate: null,
      estimatedDelivery: new Date("2026-11-14T00:00:00Z"),
      actualDelivery: new Date("2026-11-13T05:00:00Z"),
    });
    expect(reply).toContain("Diterima: 13 November 2026");
    expect(reply).not.toContain("Estimasi");
  });
});

describe("startChatSchema trackingNumber", () => {
  const base = { name: "Budi", phone: "081234567890" };
  it("accepts an IDM number or empty", () => {
    expect(startChatSchema.safeParse({ ...base, trackingNumber: "idm2026000017" }).success).toBe(true);
    expect(startChatSchema.safeParse({ ...base, trackingNumber: "" }).success).toBe(true);
  });
  it("rejects anything else", () => {
    expect(startChatSchema.safeParse({ ...base, trackingNumber: "../../users" }).success).toBe(false);
    expect(startChatSchema.safeParse({ ...base, trackingNumber: "IDM12" }).success).toBe(false);
  });
});
