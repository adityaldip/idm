import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PackageSearch, PackageX } from "lucide-react";
import { TrackingSearch } from "@/components/tracking/tracking-search";
import { TrackingMatches } from "@/components/tracking/tracking-matches";
import { findPublicTrackingMatches } from "@/services/tracking.service";

export const metadata: Metadata = {
  title: "Shipment Tracking",
  description:
    "Track your IDM shipment in real-time with your tracking number or PO number.",
};

interface TrackingPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function TrackingPage({ searchParams }: TrackingPageProps) {
  const { q } = await searchParams;
  const code = q?.trim() ?? "";
  const matches = code ? await findPublicTrackingMatches(code) : [];

  // A single hit — resi, or a PO used by exactly one shipment — goes straight to
  // the canonical detail URL so the link stays shareable.
  if (matches.length === 1) {
    redirect(`/tracking/${matches[0].trackingNumber}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mb-6 flex justify-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-secondary shadow-sm">
          <PackageSearch className="size-7" />
        </div>
      </div>

      <TrackingSearch initialCode={code} />

      {code && matches.length === 0 && (
        <div className="mt-8 rounded-xl border border-border/60 bg-muted/30 p-6 text-center">
          <PackageX className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">Pengiriman tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tidak ada pengiriman dengan nomor resi atau nomor PO{" "}
            <span className="font-mono">{code}</span>. Periksa kembali nomornya.
          </p>
        </div>
      )}

      {matches.length > 1 && (
        <div className="mt-8">
          <TrackingMatches code={code} matches={matches} />
        </div>
      )}
    </div>
  );
}
