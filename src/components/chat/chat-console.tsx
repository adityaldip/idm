"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, History, Loader2, Lock, LockOpen, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { whatsappNumber } from "@/lib/chat";
import { cn } from "@/lib/utils";
import { ChatMessageBody, formatChatTime } from "@/components/chat/chat-message-body";
import { usePolling } from "@/components/chat/use-polling";
import type { ChatMessageView } from "@/services/chat.service";

type ConversationItem = {
  id: string;
  visitorName: string;
  visitorPhone: string;
  trackingNumber: string | null;
  status: "OPEN" | "CLOSED";
  unreadForAgent: number;
  lastMessageAt: string;
  assignedTo: { name: string } | null;
  lastMessage: { body: string; sender: ChatMessageView["sender"] } | null;
};

type ConversationDetail = {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitorEmail: string | null;
  trackingNumber: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  assignedTo: { id: string; name: string } | null;
  previous: { id: string; createdAt: string; status: "OPEN" | "CLOSED" }[];
};

async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!json?.success) {
    if (init?.method) toast.error(json?.error?.message ?? "Permintaan gagal");
    return null;
  }
  return json.data as T;
}

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

function listTime(iso: string) {
  const d = new Date(iso);
  return d.toDateString() === new Date().toDateString() ? formatChatTime(iso) : dateFormat.format(d);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ChatConsole({ canWrite }: { canWrite: boolean }) {
  const [filter, setFilter] = useState<"OPEN" | "CLOSED">("OPEN");
  const [items, setItems] = useState<ConversationItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A response for the previous filter can land after switching; ignore it.
  const filterRef = useRef(filter);
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  const pollList = useCallback(async () => {
    const data = await getJson<ConversationItem[]>(`/api/v1/chat/admin/conversations?status=${filter}`);
    if (data && filterRef.current === filter) setItems(data);
  }, [filter]);

  usePolling(pollList, { intervalMs: 10_000 });

  const unreadTotal = items?.reduce((sum, c) => sum + c.unreadForAgent, 0) ?? 0;
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${base}` : base;
  }, [unreadTotal]);

  return (
    <div className="flex h-[calc(100dvh-12rem)] min-h-[480px] overflow-hidden rounded-xl border border-border bg-card">
      <aside
        className={cn(
          "w-full shrink-0 flex-col border-r border-border md:flex md:w-80",
          selectedId ? "hidden" : "flex",
        )}
      >
        <div className="flex gap-2 border-b border-border p-3">
          {(["OPEN", "CLOSED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setFilter(s);
                setItems(null);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {s === "OPEN" ? "Open" : "Closed"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {items === null ? (
            <div className="flex justify-center p-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {filter === "OPEN" ? "Belum ada chat yang terbuka." : "Belum ada chat yang ditutup."}
            </p>
          ) : (
            items.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "flex w-full gap-3 border-b border-border px-3 py-3 text-left hover:bg-muted/60",
                  selectedId === c.id && "bg-muted",
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(c.visitorName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.visitorName}</span>
                    {c.unreadForAgent > 0 ? (
                      <span className="rounded-full bg-gold px-1.5 text-[11px] font-semibold text-gold-foreground">
                        {c.unreadForAgent}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[11px] text-muted-foreground">{listTime(c.lastMessageAt)}</span>
                    )}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.lastMessage?.sender === "BOT" && "Bot: "}
                    {c.lastMessage?.sender === "AGENT" && "CS: "}
                    {c.lastMessage?.body ?? ""}
                  </span>
                  {c.assignedTo && (
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">CS: {c.assignedTo.name}</span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className={cn("min-w-0 flex-1 flex-col", selectedId ? "flex" : "hidden md:flex")}>
        {selectedId ? (
          <ConversationPane
            key={selectedId}
            id={selectedId}
            canWrite={canWrite}
            onBack={() => setSelectedId(null)}
            onSelect={setSelectedId}
            onChanged={pollList}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="size-8" />
            <p className="text-sm">Pilih percakapan di sebelah kiri.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ConversationPane({
  id,
  canWrite,
  onBack,
  onSelect,
  onChanged,
}: {
  id: string;
  canWrite: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
  onChanged: () => Promise<void>;
}) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessageView[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const lastSeq = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void getJson<ConversationDetail>(`/api/v1/chat/admin/conversations/${id}`).then(setDetail);
  }, [id]);

  const pollMessages = useCallback(async () => {
    const data = await getJson<ChatMessageView[]>(
      `/api/v1/chat/admin/conversations/${id}/messages?after=${lastSeq.current}`,
    );
    if (!data?.length) return;
    const firstLoad = lastSeq.current === 0;
    lastSeq.current = data.at(-1)!.seq;
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      return [...prev, ...data.filter((m) => !ids.has(m.id))];
    });
    // Opening a chat marks it read; refresh the list so its unread badge clears now.
    if (firstLoad) void onChanged();
  }, [id, onChanged]);

  usePolling(pollMessages, { intervalMs: 3_000 });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const sent = await getJson<ChatMessageView>(`/api/v1/chat/admin/conversations/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (!sent) return;
    setText("");
    await pollMessages();
    if (!detail?.assignedTo || detail.status === "CLOSED") {
      void getJson<ConversationDetail>(`/api/v1/chat/admin/conversations/${id}`).then(setDetail);
    }
    void onChanged();
  }

  async function setStatus(status: "OPEN" | "CLOSED") {
    const updated = await getJson<ConversationDetail>(`/api/v1/chat/admin/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!updated) return;
    setDetail(updated);
    await pollMessages();
    void onChanged();
  }

  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={onBack} aria-label="Kembali">
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{detail.visitorName}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span>{detail.visitorPhone}</span>
            {detail.visitorEmail && <span>· {detail.visitorEmail}</span>}
            {detail.trackingNumber && (
              <span>
                · Resi{" "}
                <Link href={`/tracking/${detail.trackingNumber}`} target="_blank" className="text-primary hover:underline">
                  {detail.trackingNumber}
                </Link>
              </span>
            )}
            {detail.previous.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-1 text-emerald-700 hover:underline dark:text-emerald-400"
              >
                · <History className="size-3" /> Pernah chat {detail.previous.length}×
              </button>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a href={`https://wa.me/${whatsappNumber(detail.visitorPhone)}`} target="_blank" rel="noopener noreferrer" />
          }
        >
          WhatsApp
        </Button>
        {canWrite &&
          (detail.status === "OPEN" ? (
            <Button variant="outline" size="sm" onClick={() => setStatus("CLOSED")}>
              <Lock /> Tutup chat
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setStatus("OPEN")}>
              <LockOpen /> Buka lagi
            </Button>
          ))}
      </header>

      {showHistory && (
        <div className="flex flex-wrap gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs">
          <span className="text-muted-foreground">Chat sebelumnya:</span>
          {detail.previous.map((p) => (
            <button key={p.id} type="button" onClick={() => onSelect(p.id)} className="text-primary hover:underline">
              {dateFormat.format(new Date(p.createdAt))} ({p.status === "OPEN" ? "open" : "closed"})
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((m) =>
          m.sender === "SYSTEM" ? (
            <p key={m.id} className="self-center rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
              {m.body} · {formatChatTime(m.createdAt)}
            </p>
          ) : (
            <div
              key={m.id}
              className={cn(
                "flex max-w-[75%] flex-col gap-1",
                m.sender === "AGENT" ? "items-end self-end" : "items-start self-start",
              )}
            >
              {m.sender === "BOT" && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Bot className="size-3.5" /> IDM Assistant · otomatis
                </span>
              )}
              <div
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm",
                  m.sender === "AGENT" && "rounded-br-sm bg-primary text-primary-foreground",
                  m.sender === "BOT" && "rounded-bl-sm bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
                  m.sender === "VISITOR" && "rounded-bl-sm bg-muted",
                )}
              >
                <ChatMessageBody body={m.body} />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatChatTime(m.createdAt)}
                {m.sender === "AGENT" && m.agentName ? ` · ${m.agentName}` : ""}
              </span>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {canWrite ? (
        <form onSubmit={handleSend} className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            maxLength={2000}
            placeholder={`Balas ke ${detail.visitorName.split(" ")[0]}... (Enter kirim, Shift+Enter baris baru)`}
            className="max-h-40 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="submit" disabled={sending || !text.trim()} className="h-10">
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
            Kirim
          </Button>
        </form>
      ) : (
        <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">
          Anda hanya bisa membaca percakapan ini.
        </p>
      )}
    </>
  );
}
