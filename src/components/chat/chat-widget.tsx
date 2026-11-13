"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessageBody, formatChatTime } from "@/components/chat/chat-message-body";
import { usePolling } from "@/components/chat/use-polling";
import type { ChatMessageView } from "@/services/chat.service";

export type ChatWidgetConfig = {
  online: boolean;
  hoursText: string;
  quickReplies: string[];
};

type ChatState = {
  status: "OPEN" | "CLOSED";
  unread: number;
  messages: ChatMessageView[];
};

type ApiResult<T> = { success: true; data: T } | { success: false; error: { code: string; message: string } };

const TEASER_KEY = "idm_chat_teaser_seen";

async function api<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  return res.json();
}

export function ChatWidget({ config }: { config: ChatWidgetConfig }) {
  const [open, setOpen] = useState(false);
  // undefined = still checking, null = no chat yet
  const [chat, setChat] = useState<ChatState | null | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const lastSeq = useRef(0);

  const merge = useCallback((data: ChatState, replace = false) => {
    setChat((prev) => {
      const known = replace || !prev ? [] : prev.messages;
      const ids = new Set(known.map((m) => m.id));
      const messages = [...known, ...data.messages.filter((m) => !ids.has(m.id))];
      lastSeq.current = messages.at(-1)?.seq ?? lastSeq.current;
      return { status: data.status, unread: data.unread, messages };
    });
  }, []);

  const poll = useCallback(async () => {
    const res = await api<ChatState | null>(`/api/v1/chat/messages?after=${lastSeq.current}&read=${open ? 1 : 0}`);
    if (!res.success) return;
    if (res.data) merge(res.data);
    else setChat(null);
  }, [open, merge]);

  // First check tells us whether this browser already has a chat.
  useEffect(() => {
    void poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePolling(poll, { intervalMs: open ? 4_000 : 30_000, enabled: !!chat });

  useEffect(() => {
    if (chat !== null) return;
    let seen = false;
    try {
      seen = localStorage.getItem(TEASER_KEY) === "1";
    } catch {}
    if (seen) return;
    const t = setTimeout(() => setTeaser(true), 5_000);
    return () => clearTimeout(t);
  }, [chat]);

  function dismissTeaser() {
    setTeaser(false);
    try {
      localStorage.setItem(TEASER_KEY, "1");
    } catch {}
  }

  function toggle() {
    dismissTeaser();
    setOpen((o) => !o);
  }

  const unread = chat && !open ? chat.unread : 0;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6">
      {open && (
        <div className="pointer-events-auto flex h-[min(560px,calc(100dvh-6rem))] w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:w-[370px]">
          <header className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex size-9 items-center justify-center rounded-full bg-gold text-sm font-semibold text-gold-foreground">
              CS
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Customer Service</p>
              <p className="flex items-center gap-1.5 text-xs opacity-85">
                <span className={cn("size-2 rounded-full", config.online ? "bg-emerald-400" : "bg-slate-300")} />
                {config.online ? "Online" : `Offline · ${config.hoursText}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/10"
              aria-label="Tutup chat"
            >
              <X className="size-5" />
            </button>
          </header>

          {chat === undefined ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : chat === null || showForm ? (
            <StartForm
              onStarted={(data) => {
                lastSeq.current = 0;
                merge(data, true);
                setShowForm(false);
              }}
            />
          ) : (
            <Conversation
              chat={chat}
              quickReplies={config.quickReplies}
              afterSend={poll}
              onNewChat={() => setShowForm(true)}
            />
          )}
        </div>
      )}

      {!open && teaser && (
        <div className="pointer-events-auto relative max-w-[230px] rounded-xl border border-border bg-background px-4 py-3 pr-8 text-sm shadow-lg">
          Ada pertanyaan soal pengiriman? Chat dengan kami.
          <button
            type="button"
            onClick={dismissTeaser}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Tutup"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        className="pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg transition-transform hover:scale-105"
        aria-label={open ? "Tutup chat" : "Chat dengan CS"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-red-600 px-1 text-[11px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>
    </div>
  );
}

function StartForm({ onStarted }: { onStarted: (data: ChatState) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const res = await api<ChatState>("/api/v1/chat/conversations", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form)),
      });
      if (res.success) onStarted(res.data);
      else setError(res.error.message);
    } catch {
      setError("Gagal terhubung. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const field =
    "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      <p className="text-sm text-muted-foreground">Isi data singkat untuk mulai chat.</p>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Nama
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} />
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Nomor HP / WhatsApp
        <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="0812 3456 7890" className={field} />
      </label>
      <label className="space-y-1 text-xs font-medium text-muted-foreground">
        Nomor resi (opsional)
        <input name="trackingNumber" placeholder="IDM2026000017" className={cn(field, "uppercase placeholder:normal-case")} />
      </label>
      {/* Honeypot: hidden from people, filled in by naive bots. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-auto flex h-10 items-center justify-center gap-2 rounded-lg bg-gold text-sm font-semibold text-gold-foreground disabled:opacity-60"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Mulai chat
      </button>
    </form>
  );
}

function Conversation({
  chat,
  quickReplies,
  afterSend,
  onNewChat,
}: {
  chat: ChatState;
  quickReplies: string[];
  afterSend: () => Promise<void>;
  onNewChat: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const showQuickReplies =
    chat.status === "OPEN" && quickReplies.length > 0 && !chat.messages.some((m) => m.sender === "VISITOR");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [chat.messages.length]);

  async function send(url: string, payload: object) {
    setSending(true);
    setError(null);
    try {
      const res = await api(url, { method: "POST", body: JSON.stringify(payload) });
      if (!res.success) {
        setError(res.error.message);
        return false;
      }
      await afterSend();
      return true;
    } catch {
      setError("Pesan gagal terkirim. Coba lagi.");
      return false;
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    if (await send("/api/v1/chat/messages", { body })) setText("");
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {showQuickReplies && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickReplies.map((label, index) => (
              <button
                key={label}
                type="button"
                disabled={sending}
                onClick={() => send("/api/v1/chat/quick-reply", { index })}
                className="rounded-full border border-gold bg-background px-3 py-1 text-xs font-medium text-gold-dark hover:bg-gold/10 disabled:opacity-60 dark:text-gold"
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {chat.status === "CLOSED" && (
          <div className="mt-2 rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            Chat ini sudah ditutup. Kirim pesan untuk membukanya lagi, atau{" "}
            <button type="button" onClick={onNewChat} className="font-medium text-primary underline">
              mulai chat baru
            </button>
            .
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-3 pb-1 text-xs text-destructive">{error}</p>}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Tulis pesan..."
          aria-label="Tulis pesan"
          className="max-h-28 min-h-10 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold text-gold-foreground disabled:opacity-50"
          aria-label="Kirim"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </form>
    </>
  );
}

function MessageBubble({ message: m }: { message: ChatMessageView }) {
  if (m.sender === "SYSTEM") {
    return <p className="self-center rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">{m.body}</p>;
  }

  const mine = m.sender === "VISITOR";
  const bot = m.sender === "BOT";

  return (
    <div className={cn("flex max-w-[85%] flex-col gap-1", mine ? "self-end items-end" : "self-start items-start")}>
      {bot && (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Bot className="size-3.5" /> IDM Assistant · otomatis
        </span>
      )}
      <div
        className={cn(
          "rounded-2xl px-3 py-2 text-sm",
          mine && "rounded-br-sm bg-primary text-primary-foreground",
          bot && "rounded-bl-sm bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
          !mine && !bot && "rounded-bl-sm bg-muted text-foreground",
        )}
      >
        <ChatMessageBody body={m.body} />
      </div>
      <span className="text-[11px] text-muted-foreground">
        {formatChatTime(m.createdAt)}
        {m.sender === "AGENT" && m.agentName ? ` · ${m.agentName}` : ""}
      </span>
    </div>
  );
}
