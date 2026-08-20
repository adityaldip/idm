import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import type { PublicTrackingMatch } from "@/services/tracking.service";

/** Shown when one PO number covers several shipments — visitor picks one. */
export function TrackingMatches({
  code,
  matches,
}: {
  code: string;
  matches: PublicTrackingMatch[];
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Ditemukan {matches.length} pengiriman untuk nomor PO{" "}
        <span className="font-mono font-medium text-foreground">{code}</span>.
        Pilih salah satu untuk melihat detail pelacakan.
      </p>
      {matches.map((match) => (
        <Card key={match.trackingNumber} className="border-border/60">
          <CardContent className="p-0">
            <Link
              href={`/tracking/${match.trackingNumber}`}
              className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="font-mono font-semibold">{match.trackingNumber}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {match.senderCity} → {match.recipientCity}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {match.status.label} ·{" "}
                  {format(match.createdAt, "dd MMM yyyy")}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
