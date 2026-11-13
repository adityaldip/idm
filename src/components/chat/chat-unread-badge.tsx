"use client";

import { useCallback, useState } from "react";
import { usePolling } from "@/components/chat/use-polling";

/** Unread live-chat count for the sidebar; only rendered for roles that can see /chat. */
export function ChatUnreadBadge() {
  const [unread, setUnread] = useState(0);

  const poll = useCallback(async () => {
    const res = await fetch("/api/v1/chat/admin/unread", { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    if (json.success) setUnread(json.data.unread);
  }, []);

  usePolling(poll, { intervalMs: 10_000, hiddenIntervalMs: 60_000 });

  if (unread === 0) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[11px] font-semibold text-gold-foreground">
      {unread > 99 ? "99+" : unread}
    </span>
  );
}
