import { statusColorClass } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

export type StatusBadgeStatus = { label: string; color: string };

export function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColorClass(status.color),
      )}
    >
      {status.label}
    </span>
  );
}
