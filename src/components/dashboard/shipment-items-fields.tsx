"use client";

import { useState } from "react";
import { ItemUnit } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ITEM_UNIT_LABELS } from "@/lib/constants";
import type { ShipmentEditItemLine } from "@/lib/shipment-edit-item";

const UNITS = Object.keys(ITEM_UNIT_LABELS) as ItemUnit[];

type ItemRow = {
  name: string;
  quantity: string;
  unit: ItemUnit;
  weightKg: string;
};

const emptyRow: ItemRow = { name: "", quantity: "", unit: "PCS", weightKg: "" };

function toRows(items: ShipmentEditItemLine[]): ItemRow[] {
  if (items.length === 0) return [{ ...emptyRow }];
  return items.map((item) => ({
    name: item.name,
    quantity: String(item.quantity),
    unit: item.unit,
    weightKg: item.weightKg != null ? String(item.weightKg) : "",
  }));
}

/**
 * Repeater for the cargo lines of one shipment — a delivery usually mixes units
 * (batang tiang + roll kabel + pcs aksesoris), so quantity/unit live per line.
 * Rows are posted as a single JSON field the server action parses.
 */
export function ShipmentItemsFields({
  defaultItems = [],
}: {
  defaultItems?: ShipmentEditItemLine[];
}) {
  const [rows, setRows] = useState<ItemRow[]>(() => toRows(defaultItems));

  function update(index: number, patch: Partial<ItemRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  // Only complete rows are submitted, so a blank trailing row is harmless.
  const payload = rows
    .filter((row) => row.name.trim() !== "" && row.quantity.trim() !== "")
    .map((row) => ({
      name: row.name.trim(),
      quantity: Number(row.quantity),
      unit: row.unit,
      ...(row.weightKg.trim() !== "" && { weightKg: Number(row.weightKg) }),
    }));

  return (
    <div className="space-y-3">
      <input type="hidden" name="items" value={JSON.stringify(payload)} />

      <div className="hidden gap-3 px-1 text-xs text-muted-foreground sm:grid sm:grid-cols-[1fr_5rem_7rem_6rem_2.25rem]">
        <span>Nama Barang</span>
        <span>Qty</span>
        <span>Satuan</span>
        <span>Berat (kg)</span>
        <span />
      </div>

      {rows.map((row, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-[1fr_5rem_7rem_6rem_2.25rem] sm:items-center sm:rounded-none sm:border-0 sm:p-0"
        >
          <div>
            <Label className="sm:hidden" htmlFor={`item-name-${index}`}>
              Nama Barang
            </Label>
            <Input
              id={`item-name-${index}`}
              value={row.name}
              placeholder="Tiang beton 9m"
              onChange={(e) => update(index, { name: e.target.value })}
            />
          </div>
          <div>
            <Label className="sm:hidden" htmlFor={`item-qty-${index}`}>
              Qty
            </Label>
            <Input
              id={`item-qty-${index}`}
              type="number"
              min={0}
              step="0.01"
              value={row.quantity}
              onChange={(e) => update(index, { quantity: e.target.value })}
            />
          </div>
          <div>
            <Label className="sm:hidden" htmlFor={`item-unit-${index}`}>
              Satuan
            </Label>
            <select
              id={`item-unit-${index}`}
              value={row.unit}
              onChange={(e) =>
                update(index, { unit: e.target.value as ItemUnit })
              }
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {ITEM_UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="sm:hidden" htmlFor={`item-weight-${index}`}>
              Berat (kg)
            </Label>
            <Input
              id={`item-weight-${index}`}
              type="number"
              min={0}
              step="0.1"
              value={row.weightKg}
              onChange={(e) => update(index, { weightKg: e.target.value })}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Hapus baris"
            disabled={rows.length === 1}
            onClick={() =>
              setRows((current) => current.filter((_, i) => i !== index))
            }
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((current) => [...current, { ...emptyRow }])}
      >
        <Plus className="size-4" />
        Tambah Barang
      </Button>
    </div>
  );
}
