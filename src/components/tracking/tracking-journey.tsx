import { Check } from "lucide-react";
import type { JourneyStep } from "@/lib/shipment-status";
import type { StatusOption } from "@/lib/status-option";
import { cn } from "@/lib/utils";
import { StatusIcon, VehicleIcon } from "./status-icon";

type Step = JourneyStep<StatusOption>;

/** Origin → destination line with the vehicle sitting at the progress point. */
export function TrackingRoute({
  from,
  to,
  progress,
  serviceIcon,
  halted,
}: {
  from: string;
  to: string;
  progress: number;
  serviceIcon: string | null | undefined;
  /** The shipment ended on a problem status (e.g. returned): draw it in red. */
  halted: boolean;
}) {
  // Keep the vehicle badge inside the line at both ends.
  const position = Math.min(Math.max(progress, 4), 96);

  return (
    <div>
      <div className="flex items-end justify-between gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Asal
          </p>
          <p className="font-heading text-lg font-semibold">{from}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Tujuan
          </p>
          <p className="font-heading text-lg font-semibold">{to}</p>
        </div>
      </div>

      <div className="relative mt-5 h-10">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted" />
        <span className="absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full border-2 border-gold bg-background" />
        <span className="absolute top-1/2 right-0 size-3 -translate-y-1/2 rounded-full border-2 border-muted-foreground/40 bg-background" />
        {/* Final width/left are rendered on the server; the CSS keyframes only
            supply the starting point, so no JS is needed to place them. */}
        <div
          className={cn(
            "route-fill absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full",
            halted
              ? "bg-gradient-to-r from-gold/70 to-red-500"
              : "bg-gradient-to-r from-gold/50 to-gold",
          )}
          style={{ width: `${progress}%` }}
        />
        <div
          className="route-vehicle absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${position}%` }}
        >
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full text-white shadow-lg ring-4 ring-background",
              halted ? "bg-red-500 shadow-red-500/30" : "bg-gold shadow-gold/40",
            )}
          >
            <VehicleIcon
              icon={serviceIcon}
              className={cn("size-5", halted && "-scale-x-100")}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

// Long journeys keep the first and the latest steps and fold the middle.
const MAX_VISIBLE = 6;
const KEEP_HEAD = 1;

type Item =
  | { kind: "step"; step: Step }
  | { kind: "more"; count: number; labels: string[] }
  | { kind: "target"; status: StatusOption };

function buildItems(steps: Step[], target?: StatusOption): Item[] {
  const items: Item[] = steps.map((step) => ({ kind: "step", step }));
  const budget = MAX_VISIBLE - (target ? 1 : 0);
  if (items.length > budget) {
    const keepTail = budget - KEEP_HEAD - 1;
    const hidden = steps.slice(KEEP_HEAD, steps.length - keepTail);
    items.splice(KEEP_HEAD, hidden.length, {
      kind: "more",
      count: hidden.length,
      labels: hidden.map((s) => s.label),
    });
  }
  if (target) items.push({ kind: "target", status: target });
  return items;
}

/** The shipment's actual journey, ending at the final status still ahead. */
export function TrackingStepper({
  steps,
  target,
}: {
  steps: Step[];
  target?: StatusOption;
}) {
  const items = buildItems(steps, target);

  return (
    <ol className="-mx-2 flex overflow-x-auto px-2 pb-1">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        // The connector after an item is "travelled" unless it leads to the target.
        const travelled = items[i + 1] != null && items[i + 1].kind !== "target";
        const key =
          item.kind === "step"
            ? `${item.step.id}-${i}`
            : item.kind === "target"
              ? `target-${item.status.id}`
              : "more";

        return (
          <li
            key={key}
            className="relative flex min-w-[5.5rem] flex-1 flex-col items-center text-center"
          >
            {!isLast && (
              <span
                className={cn(
                  "absolute top-5 left-1/2 h-0.5 w-full",
                  travelled ? "bg-gold/60" : "border-t-2 border-dashed border-border",
                )}
                aria-hidden
              />
            )}

            {item.kind === "step" && (
              <>
                <span
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-full ring-4 ring-background",
                    // Tint over an opaque base so the connector line behind
                    // the circle doesn't show through.
                    item.step.state === "done" &&
                      "bg-card bg-linear-to-r from-gold/15 to-gold/15 text-gold-dark dark:text-gold",
                    item.step.state === "current" &&
                      "bg-gold text-white shadow-lg shadow-gold/40",
                    item.step.state === "problem" &&
                      "bg-red-500 text-white shadow-lg shadow-red-500/30",
                  )}
                >
                  {item.step.state === "current" && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-gold/40" />
                  )}
                  {item.step.state === "done" ? (
                    <Check className="relative size-5" />
                  ) : (
                    <StatusIcon code={item.step.code} className="relative size-4.5" />
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 px-1 text-xs leading-tight",
                    item.step.state === "problem"
                      ? "font-semibold text-red-600 dark:text-red-400"
                      : item.step.state === "current"
                        ? "font-semibold text-foreground"
                        : "text-foreground/80",
                  )}
                >
                  {item.step.label}
                </span>
              </>
            )}

            {item.kind === "more" && (
              <>
                <span
                  className="relative flex size-10 items-center justify-center rounded-full bg-card bg-linear-to-r from-gold/15 to-gold/15 font-mono text-xs font-bold text-gold-dark ring-4 ring-background dark:text-gold"
                  title={item.labels.join(" → ")}
                >
                  +{item.count}
                </span>
                <span className="mt-2 px-1 text-xs leading-tight text-muted-foreground">
                  {item.count} tahap lain
                </span>
              </>
            )}

            {item.kind === "target" && (
              <>
                <span className="relative flex size-10 items-center justify-center rounded-full border-2 border-dashed border-border bg-background text-muted-foreground ring-4 ring-background">
                  <StatusIcon code={item.status.code} className="size-4.5" />
                </span>
                <span className="mt-2 px-1 text-xs leading-tight text-muted-foreground">
                  {item.status.label}
                </span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
