import { describe, it, expect } from "vitest";
import { sniffImageType, formatBytes } from "@/lib/tracking-photo";

describe("sniffImageType", () => {
  it("recognises JPEG, PNG, and WebP magic bytes", () => {
    expect(sniffImageType(Uint8Array.of(0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0))).toBe(
      "jpeg",
    );
    expect(
      sniffImageType(Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0)),
    ).toBe("png");

    const webp = new Uint8Array(12);
    webp.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
    webp.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
    expect(sniffImageType(webp)).toBe("webp");
  });

  it("rejects short or unknown buffers", () => {
    expect(sniffImageType(Uint8Array.of(0x00, 0x01))).toBe(null);
    expect(sniffImageType(new Uint8Array(16))).toBe(null);
  });
});

describe("formatBytes", () => {
  it("formats KB and MB", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
