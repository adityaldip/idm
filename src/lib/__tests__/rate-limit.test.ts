import { describe, expect, it } from "vitest";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const req = (headers: Record<string, string>) => new Request("http://localhost/", { headers });

describe("getClientIp", () => {
  it("trusts only the last X-Forwarded-For entry (added by the proxy)", () => {
    expect(getClientIp(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2, 203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("falls back to X-Real-IP, then 'unknown'", () => {
    expect(getClientIp(req({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(getClientIp(req({}))).toBe("unknown");
  });
});

describe("rateLimit", () => {
  it("blocks after the limit within a window", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});
