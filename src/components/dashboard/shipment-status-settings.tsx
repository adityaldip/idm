"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { saveShipmentStatusesAction } from "@/app/(dashboard)/settings/shipment-status/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STATUS_COLORS,
  allowedNextStatuses,
  statusColorClass,
} from "@/lib/shipment-status";
import type { StatusDefLike } from "@/lib/shipment-status";

type Row = {
  id?: string;
  code?: string;
  label: string;
  color: string;
  isFinal: boolean;
  allowFromAny: boolean;
  isActive: boolean;
};

function toRows(statuses: StatusDefLike[]): Row[] {
  return statuses.map((s) => ({
    id: s.id,
    code: s.code,
    label: s.label,
    color: s.color,
    isFinal: s.isFinal,
    allowFromAny: s.allowFromAny,
    isActive: s.isActive,
  }));
}

/** Rows preview the derived workflow, so reordering shows its effect at once. */
function previewDefs(rows: Row[]): StatusDefLike[] {
  return rows.map((row, index) => ({
    id: row.id ?? `new-${index}`,
    code: row.code ?? row.label,
    label: row.label,
    color: row.color,
    sortOrder: index,
    isInitial: false,
    isFinal: row.isFinal,
    allowFromAny: row.allowFromAny,
    isActive: row.isActive,
  }));
}

export function ShipmentStatusSettings({
  statuses,
}: {
  statuses: StatusDefLike[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => toRows(statuses));
  const [initialIndex, setInitialIndex] = useState(() => {
    const found = statuses.findIndex((s) => s.isInitial);
    return found >= 0 ? found : 0;
  });
  const [saving, setSaving] = useState(false);

  function update(index: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    setRows((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    // Keep the initial-status choice pointing at the same row after the swap.
    setInitialIndex((current) =>
      current === index ? target : current === target ? index : current,
    );
  }

  function remove(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
    setInitialIndex((current) =>
      current === index ? 0 : current > index ? current - 1 : current,
    );
  }

  async function handleSave() {
    if (rows.some((row) => row.label.trim() === "")) {
      toast.error("Nama status tidak boleh kosong.");
      return;
    }
    setSaving(true);
    const result = await saveShipmentStatusesAction({ statuses: rows, initialIndex });
    setSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Status pengiriman tersimpan");
    router.refresh();
  }

  const defs = previewDefs(rows);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.map((row, index) => (
            <div
              key={row.id ?? `new-${index}`}
              className="grid gap-3 rounded-xl border border-border/60 p-4 lg:grid-cols-[auto_1fr_9rem_auto]"
            >
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Naikkan"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Turunkan"
                  disabled={index === rows.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`label-${index}`}>Nama Status</Label>
                <Input
                  id={`label-${index}`}
                  value={row.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                />
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="initial"
                      checked={initialIndex === index}
                      onChange={() => setInitialIndex(index)}
                    />
                    Status awal
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.isFinal}
                      onChange={(e) => update(index, { isFinal: e.target.checked })}
                    />
                    Status akhir
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.allowFromAny}
                      onChange={(e) =>
                        update(index, { allowFromAny: e.target.checked })
                      }
                    />
                    Bisa dari mana saja
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      onChange={(e) => update(index, { isActive: e.target.checked })}
                    />
                    Aktif
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`color-${index}`}>Warna</Label>
                <select
                  id={`color-${index}`}
                  value={row.color}
                  onChange={(e) => update(index, { color: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {STATUS_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorClass(row.color)}`}
                >
                  {row.label || "Contoh"}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Hapus status"
                disabled={rows.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((current) => [
                ...current,
                {
                  label: "",
                  color: "slate",
                  isFinal: false,
                  allowFromAny: false,
                  isActive: true,
                },
              ])
            }
          >
            <Plus className="size-4" />
            Tambah Status
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alur yang Dihasilkan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {defs.map((current) => {
            const next = allowedNextStatuses(current.id, defs);
            return (
              <div key={current.id} className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorClass(current.color)}`}
                >
                  {current.label || "—"}
                </span>
                <span className="text-muted-foreground">→</span>
                {next.length === 0 ? (
                  <span className="text-muted-foreground">
                    status akhir, tidak ada lanjutan
                  </span>
                ) : (
                  next.map((n) => (
                    <span
                      key={n.id}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorClass(n.color)}`}
                    >
                      {n.label || "—"}
                    </span>
                  ))
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </div>
  );
}
