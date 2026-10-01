import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import type { PublicTrackingMatch } from "@/services/tracking.service";
import { statusColorClass } from "@/lib/shipment-status";
import { cn } from "@/lib/utils";
import { StatusIcon } from "./status-icon";

/** Shown when one PO number covers several shipments — visitor picks one. */
export function TrackingMatches({
  code,
  matches,
}: {
  code: string;
  matches: PublicTrackingMatch[];
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-2xl shadow-black/10 md:p-8">
      <p className="font-heading text-lg font-semibold">
        {matches.length} pengiriman ditemukan
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Nomor PO <span className="font-mono font-medium text-foreground">{code}</span>{" "}
        mencakup beberapa pengiriman. Pilih salah satu untuk melihat detailnya.
      </p>

      <ul className="mt-6 space-y-3">
        {matches.map((match) => {
          return (
            <li key={match.trackingNumber}>
              <Link
                href={`/tracking/${match.trackingNumber}`}
                className="group flex items-center gap-4 rounded-xl border border-border/60 p-4 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lg hover:shadow-black/10"
              >
                <span
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-xl",
                    statusColorClass(match.status.color),
                  )}
                >
                  <StatusIcon code={match.status.code} className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-semibold">{match.trackingNumber}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                    {match.senderCity}
                    <MoveRight className="size-3.5 shrink-0" />
                    {match.recipientCity}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{match.status.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(match.createdAt, "dd MMM yyyy", { locale: localeId })}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-gold" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
