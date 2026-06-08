"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { ShipmentStatus } from "@prisma/client";

type BranchOption = { id: string; name: string; city: string };

export function ShipmentsFilters({
  branches = [],
}: {
  branches?: BranchOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    router.push(`/shipments?${params.toString()}`);
  }

  const selectClass =
    "h-9 rounded-lg border border-input bg-background px-3 text-sm";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="shipment-search"
            placeholder="Search tracking #, sender, recipient..."
            className="pl-9"
            defaultValue={searchParams.get("search") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({
                  search: (e.target as HTMLInputElement).value,
                });
              }
            }}
          />
        </div>
        <select
          className={selectClass}
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParams({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          {Object.values(ShipmentStatus).map((status) => (
            <option key={status} value={status}>
              {SHIPMENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        {branches.length > 0 && (
          <select
            className={selectClass}
            defaultValue={searchParams.get("branchId") ?? ""}
            onChange={(e) => updateParams({ branchId: e.target.value })}
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const input = document.getElementById(
              "shipment-search",
            ) as HTMLInputElement | null;
            updateParams({ search: input?.value ?? "" });
          }}
        >
          Search
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="date"
          className="h-9 w-auto"
          defaultValue={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => updateParams({ dateFrom: e.target.value })}
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          className="h-9 w-auto"
          defaultValue={searchParams.get("dateTo") ?? ""}
          onChange={(e) => updateParams({ dateTo: e.target.value })}
        />
        {(searchParams.get("dateFrom") ||
          searchParams.get("dateTo") ||
          searchParams.get("branchId") ||
          searchParams.get("status") ||
          searchParams.get("search")) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/shipments")}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
