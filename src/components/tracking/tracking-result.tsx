import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  CalendarCheck,
  CalendarClock,
  Car,
  MapPin,
  Package,
  UserRound,
  Weight,
  type LucideIcon,
} from "lucide-react";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import {
  TrackingRoute,
  TrackingStepper,
} from "@/components/tracking/tracking-journey";
import type { PublicTrackingData } from "@/types/public-tracking";
import type { TrackingJourney } from "@/lib/shipment-status";
import type { StatusOption } from "@/lib/status-option";
import { statusSolidClass } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";
import { StatusIcon } from "./status-icon";

interface TrackingResultProps {
  shipment: PublicTrackingData;
  journey: TrackingJourney<StatusOption>;
}

const formatDate = (date: Date) =>
  format(date, "dd MMM yyyy", { locale: localeId });

function DetailCard({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-gold-dark dark:text-gold">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-0.5 font-semibold break-words",
            mono && "font-mono tracking-wide",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export function TrackingResult({ shipment, journey }: TrackingResultProps) {
  const delivered = shipment.actualDelivery != null;

  const details: { icon: LucideIcon; label: string; value: string; mono?: boolean }[] = [];
  if (shipment.serviceOffering) {
    details.push({ icon: Package, label: "Layanan", value: shipment.serviceOffering.name });
  }
  if (delivered) {
    details.push({
      icon: CalendarCheck,
      label: "Diterima",
      value: formatDate(shipment.actualDelivery!),
    });
  } else if (shipment.estimatedDelivery) {
    details.push({
      icon: CalendarClock,
      label: "Estimasi Tiba",
      value: formatDate(shipment.estimatedDelivery),
    });
  }
  if (shipment.currentLocation) {
    details.push({ icon: MapPin, label: "Lokasi Terkini", value: shipment.currentLocation });
  }
  details.push({
    icon: Weight,
    label: "Berat & Koli",
    value: [
      shipment.weight != null ? `${shipment.weight.toLocaleString("id-ID")} kg` : null,
      `${shipment.packageCount} koli`,
    ]
      .filter(Boolean)
      .join(" · "),
  });
  if (shipment.driver) {
    details.push({ icon: UserRound, label: "Pengemudi", value: shipment.driver.name });
  }
  if (shipment.vehicle) {
    details.push({
      icon: Car,
      label: "Kendaraan",
      value: shipment.vehicle.plateNumber,
      mono: true,
    });
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/10">
        <div className="h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />
        <div className="space-y-8 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Nomor Resi
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wider md:text-3xl">
                {shipment.trackingNumber}
              </p>
              {shipment.poNumber && (
                <p className="mt-1 text-sm text-muted-foreground">
                  No. PO{" "}
                  <span className="font-mono font-medium text-foreground">
                    {shipment.poNumber}
                  </span>
                </p>
              )}
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md",
                statusSolidClass(shipment.status.color),
              )}
            >
              <StatusIcon code={shipment.status.code} className="size-4" />
              {shipment.status.label}
            </span>
          </div>

          <TrackingRoute
            from={shipment.senderCity}
            to={shipment.recipientCity}
            progress={journey.progress}
            serviceIcon={shipment.serviceOffering?.icon}
            halted={journey.halted}
          />

          <div className="border-t border-border/60 pt-6">
            <TrackingStepper steps={journey.steps} target={journey.target} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((d) => (
          <DetailCard key={d.label} {...d} />
        ))}
      </div>

      {/* History */}
      <div>
        <h2 className="font-heading text-xl font-semibold">Riwayat Pengiriman</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Diurutkan dari pembaruan terbaru.
        </p>
        <div className="mt-6">
          <TrackingTimeline events={shipment.trackingHistory} />
        </div>
      </div>
    </div>
  );
}
