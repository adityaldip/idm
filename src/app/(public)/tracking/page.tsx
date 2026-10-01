import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileSearch, Headset, PackageX, ReceiptText } from "lucide-react";
import { TrackingHero } from "@/components/tracking/tracking-hero";
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

const TIPS = [
  {
    icon: ReceiptText,
    title: "Nomor resi",
    body: "Tertera di bukti pengiriman, diawali IDM lalu tahun, contoh IDM2026000001.",
  },
  {
    icon: FileSearch,
    title: "Nomor PO",
    body: "Bisa juga mencari dengan nomor PO perusahaan Anda. Satu PO dapat mencakup beberapa pengiriman.",
  },
  {
    icon: Headset,
    title: "Butuh bantuan?",
    body: "Hubungi customer service kami bila nomor Anda tidak ditemukan.",
  },
];

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
    <>
      <TrackingHero
        title="Lacak Pengiriman Anda"
        description="Masukkan nomor resi atau nomor PO untuk melihat posisi dan riwayat pengiriman secara real-time."
      >
        <TrackingSearch initialCode={code} />
      </TrackingHero>

      <div className="relative mx-auto -mt-16 max-w-4xl px-4 pb-20 md:px-6 lg:px-8">
        {code && matches.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-2xl shadow-black/10">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <PackageX className="size-7" />
            </span>
            <p className="mt-4 font-heading text-lg font-semibold">
              Pengiriman tidak ditemukan
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tidak ada pengiriman dengan nomor resi atau nomor PO{" "}
              <span className="font-mono font-medium text-foreground">{code}</span>.
              Periksa kembali nomornya.
            </p>
          </div>
        )}

        {matches.length > 1 && <TrackingMatches code={code} matches={matches} />}

        {!code && (
          <div className="grid gap-4 md:grid-cols-3">
            {TIPS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border/60 bg-card p-6 shadow-xl shadow-black/5"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-gold/12 text-gold-dark dark:text-gold">
                  <Icon className="size-5" />
                </span>
                <p className="mt-4 font-heading font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
