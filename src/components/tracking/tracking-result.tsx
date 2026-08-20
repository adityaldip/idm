import { format } from "date-fns";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { TrackingSearch } from "@/components/tracking/tracking-search";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicTrackingData } from "@/types/public-tracking";
import { statusColorClass } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";

interface TrackingResultProps {
  shipment: PublicTrackingData;
  progress: number;
}

export function TrackingResult({ shipment, progress }: TrackingResultProps) {

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
              {shipment.poNumber && (
                <p className="mt-2 text-sm text-white/70">
                  No. PO{" "}
                  <span className="font-mono text-white">
                    {shipment.poNumber}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium",
                    statusColorClass(shipment.status.color),
                  )}
                >
                  {shipment.status.label}
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
