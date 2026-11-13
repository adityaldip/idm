"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveChatSettingsAction } from "@/app/(dashboard)/chat/settings/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input, inputClass, selectClass, textareaClass } from "@/components/dashboard/form-sheet";
import { DAY_NAMES, formatWorkingHours, renderChatTemplate, type ChatSettings } from "@/lib/chat";
import { cn } from "@/lib/utils";

// Senin first, Minggu last.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function ChatSettingsForm({ settings: initial }: { settings: ChatSettings }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  function toggleDay(day: number) {
    const days = s.hours.days.includes(day) ? s.hours.days.filter((d) => d !== day) : [...s.hours.days, day];
    update("hours", { ...s.hours, days: days.sort((a, b) => a - b) });
  }

  async function handleSave() {
    setSaving(true);
    const result = await saveChatSettingsAction(s);
    setSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Pengaturan chat disimpan");
    router.refresh();
  }

  const previewVars = { nama: "Budi", jam_kerja: formatWorkingHours(s.hours) };
  const previewOnline = renderChatTemplate(s.welcome, previewVars);
  const previewOffline = renderChatTemplate(s.welcomeOffline, previewVars);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Widget</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={(e) => update("enabled", e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              Tampilkan widget live chat di website
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pesan sambutan bot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Variabel: <code className="rounded bg-muted px-1">{"{nama}"}</code> (nama depan pengunjung),{" "}
              <code className="rounded bg-muted px-1">{"{jam_kerja}"}</code> ({formatWorkingHours(s.hours)}).
            </p>
            <div className="space-y-2">
              <Label htmlFor="welcome">Di dalam jam kerja</Label>
              <textarea
                id="welcome"
                rows={4}
                value={s.welcome}
                onChange={(e) => update("welcome", e.target.value)}
                className={cn(textareaClass, "h-auto")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeOffline">Di luar jam kerja</Label>
              <textarea
                id="welcomeOffline"
                rows={3}
                value={s.welcomeOffline}
                onChange={(e) => update("welcomeOffline", e.target.value)}
                className={cn(textareaClass, "h-auto")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jam kerja CS (WIB)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DAY_ORDER.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    s.hours.days.includes(d)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {DAY_NAMES[d]}
                </button>
              ))}
            </div>
            <div className="grid max-w-sm grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="open">Buka</Label>
                <Input
                  id="open"
                  type="time"
                  value={s.hours.open}
                  onChange={(e) => update("hours", { ...s.hours, open: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close">Tutup</Label>
                <Input
                  id="close"
                  type="time"
                  value={s.hours.close}
                  onChange={(e) => update("hours", { ...s.hours, close: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tombol pilihan cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Muncul di bawah pesan sambutan sampai pengunjung mengirim pesan pertama. Aksi &quot;Cek status
              resi&quot; dijawab otomatis oleh bot dari data tracking.
            </p>
            {s.quickReplies.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={q.label}
                  maxLength={40}
                  onChange={(e) =>
                    update(
                      "quickReplies",
                      s.quickReplies.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                    )
                  }
                  aria-label={`Label tombol ${i + 1}`}
                  className={cn(inputClass, "flex-1")}
                />
                <select
                  value={q.action}
                  onChange={(e) =>
                    update(
                      "quickReplies",
                      s.quickReplies.map((x, j) =>
                        j === i ? { ...x, action: e.target.value as "track" | "text" } : x,
                      ),
                    )
                  }
                  aria-label={`Aksi tombol ${i + 1}`}
                  className={cn(selectClass, "w-48")}
                >
                  <option value="track">Cek status resi (bot)</option>
                  <option value="text">Kirim ke CS</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => update("quickReplies", s.quickReplies.filter((_, j) => j !== i))}
                  aria-label={`Hapus tombol ${i + 1}`}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            {s.quickReplies.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => update("quickReplies", [...s.quickReplies, { label: "", action: "text" }])}
              >
                <Plus /> Tambah tombol
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            Simpan pengaturan
          </Button>
        </div>
      </div>

      <Card className="h-fit xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {[
            ["Jam kerja", previewOnline],
            ["Di luar jam kerja", previewOffline],
          ].map(([label, text]) => (
            <div key={label} className="space-y-1">
              <p className="text-xs text-muted-foreground">{label}</p>
              <div className="whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-amber-50 px-3 py-2 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                {text}
              </div>
            </div>
          ))}
          {s.quickReplies.some((q) => q.label.trim()) && (
            <div className="flex flex-wrap gap-2">
              {s.quickReplies
                .filter((q) => q.label.trim())
                .map((q, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-gold px-3 py-1 text-xs font-medium text-gold-dark dark:text-gold"
                  >
                    {q.label}
                  </span>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
