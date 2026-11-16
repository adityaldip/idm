type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();
const PRUNE_EVERY_MS = 60_000;
let lastPrune = 0;

/** Drops expired windows so the in-memory store can't grow without bound. */
function pruneExpired(now: number) {
  if (now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  pruneExpired(now);
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * The app sits behind one reverse proxy (LiteSpeed), which appends the real client
 * address to X-Forwarded-For. Earlier entries come from the client and can be forged,
 * so only the last one is trusted.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const last = forwarded.split(",").at(-1)?.trim();
    if (last) return last;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
