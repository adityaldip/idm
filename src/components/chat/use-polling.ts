"use client";

import { useEffect } from "react";

/**
 * Calls `poll` every `intervalMs` (or `hiddenIntervalMs` while the tab is hidden),
 * waiting for each call to finish before scheduling the next one. Becoming visible
 * again, or `poll` changing (e.g. a new filter), triggers an immediate poll, so keep
 * `poll` stable with useCallback.
 */
export function usePolling(
  poll: () => Promise<unknown>,
  { intervalMs, hiddenIntervalMs = 30_000, enabled = true }: {
    intervalMs: number;
    hiddenIntervalMs?: number;
    enabled?: boolean;
  },
) {
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let inFlight = false;

    const schedule = () => {
      const delay = document.visibilityState === "visible" ? intervalMs : hiddenIntervalMs;
      timer = setTimeout(run, delay);
    };
    const run = async () => {
      if (inFlight || stopped) return;
      inFlight = true;
      clearTimeout(timer);
      try {
        await poll();
      } catch {
        // Network blips are expected; the next tick retries.
      }
      inFlight = false;
      if (!stopped) schedule();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void run();
    };

    void run();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll, enabled, intervalMs, hiddenIntervalMs]);
}
