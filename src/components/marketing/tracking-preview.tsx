import { Check, MapPin, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Illustration of the public tracking result — mirrors the real timeline so the
 * landing page shows what a visitor gets after entering a resi number.
 */
const SAMPLE_EVENTS = [
  { label: "Pesanan dibuat", location: "Semarang", time: "08:15", state: "done" },
  { label: "Barang dijemput", location: "Semarang", time: "10:40", state: "done" },
  { label: "Tiba di gudang", location: "Semarang Hub", time: "14:05", state: "done" },
  {
    label: "Dalam perjalanan",
    location: "Surabaya Hub",
    time: "06:20",
    state: "current",
  },
  { label: "Siap diantar", location: "Surabaya", time: "—", state: "pending" },
] as const;

export function TrackingPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-transparent to-gold/15 blur-2xl" />

      <Card className="relative overflow-hidden border-border/60 shadow-xl shadow-primary/10">
        <div className="h-1.5 bg-gradient-to-r from-primary via-gold to-gold-dark" />
        <CardContent className="p-6 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-muted-foreground">
                Nomor Resi
              </p>
              <p className="mt-1 font-mono text-base font-semibold tracking-wider">
                IDM2026000001
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary ring-1 ring-secondary/25">
              <Truck className="size-3.5" />
              Dalam Perjalanan
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                Semarang
              </span>
              <span>Surabaya</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-primary to-gold" />
            </div>
          </div>

          <ol className="mt-7">
            {SAMPLE_EVENTS.map((event, index) => {
              const isLast = index === SAMPLE_EVENTS.length - 1;
              return (
                <li key={event.label} className="relative flex gap-4 pb-5 last:pb-0">
                  {!isLast && (
                    <span
                      className="absolute top-6 left-[11px] h-full w-0.5 bg-border"
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                      event.state === "current" &&
                        "border-secondary bg-secondary text-secondary-foreground shadow-[0_0_0_4px] shadow-secondary/20",
                      event.state === "done" &&
                        "border-primary bg-primary text-primary-foreground",
                      event.state === "pending" &&
                        "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {event.state === "done" && <Check className="size-3" />}
                    {event.state === "current" && (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>

                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        event.state === "pending" && "text-muted-foreground",
                      )}
                    >
                      {event.label}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {event.location}
                      </span>
                    </p>
                    <time className="font-mono text-xs text-muted-foreground">
                      {event.time}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
