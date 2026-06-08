import type { ShipmentStatus } from "@prisma/client";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  CREATED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  PICKED_UP: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  IN_WAREHOUSE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  IN_TRANSIT: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  RETURNED: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      )}
    >
      {SHIPMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
