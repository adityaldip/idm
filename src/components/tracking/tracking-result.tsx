import { format } from "date-fns";
import type { ShipmentStatus } from "@prisma/client";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { TrackingSearch } from "@/components/tracking/tracking-search";
import { Card, CardContent } from "@/components/ui/card";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import type { PublicTrackingData } from "@/types/public-tracking";
import { cn } from "@/lib/utils";

const statusColors: Record<ShipmentStatus, string> = {
  CREATED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  PICKED_UP: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  IN_WAREHOUSE: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  IN_TRANSIT: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  RETURNED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const statusProgress: Record<ShipmentStatus, number> = {
  CREATED: 10,
  PICKED_UP: 25,
  IN_WAREHOUSE: 40,
  IN_TRANSIT: 60,
  OUT_FOR_DELIVERY: 80,
  DELIVERED: 100,
  RETURNED: 100,
};

interface TrackingResultProps {
  shipment: PublicTrackingData;
}

export function TrackingResult({ shipment }: TrackingResultProps) {
  const progress = statusProgress[shipment.status];

  return (
    <div className="space-y-8">
      <TrackingSearch />

      <Card className="overflow-hidden border-border/60 shadow-xl shadow-primary/5">
        <CardContent className="p-0">
          <div className="hero-gradient relative p-6 text-white">
            <div className="hero-pattern absolute inset-0 opacity-30" />
            <div className="relative">
              <p className="text-sm text-white/70">Tracking Number</p>
              <p className="font-mono text-2xl font-bold tracking-wider">
                {shipment.trackingNumber}
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium",
                    statusColors[shipment.status],
                  )}
                >
                  {SHIPMENT_STATUS_LABELS[shipment.status]}
                </span>
              </div>
              {shipment.estimatedDelivery && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Estimated Delivery
                  </p>
                  <p className="mt-1 font-medium">
                    {format(shipment.estimatedDelivery, "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </div>

            {shipment.serviceOffering && (
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="mt-1 font-medium">
                  {shipment.serviceOffering.name}
                </p>
              </div>
            )}

            {shipment.currentLocation && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Current Location
                </p>
                <p className="mt-1 font-medium">{shipment.currentLocation}</p>
              </div>
            )}

            <div>
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">From</p>
                <p className="font-medium">{shipment.senderCity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">To</p>
                <p className="font-medium">{shipment.recipientCity}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading text-xl font-semibold">Tracking History</h2>
        <div className="mt-4">
          <TrackingTimeline
            events={shipment.trackingHistory}
            currentStatus={shipment.status}
          />
        </div>
      </div>
    </div>
  );
}
