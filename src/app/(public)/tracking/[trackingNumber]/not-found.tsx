import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingHero } from "@/components/tracking/tracking-hero";
import { TrackingSearch } from "@/components/tracking/tracking-search";

export default function TrackingNotFound() {
  return (
    <>
      <TrackingHero
        title="Lacak Pengiriman Anda"
        description="Masukkan nomor resi atau nomor PO untuk melihat posisi dan riwayat pengiriman."
      >
        <TrackingSearch />
      </TrackingHero>
      <div className="relative mx-auto -mt-16 max-w-4xl px-4 pb-20 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-2xl shadow-black/10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <PackageX className="size-7" />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold">
            Pengiriman tidak ditemukan
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nomor resi tersebut tidak terdaftar. Periksa kembali nomornya lalu
            coba lagi.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/" />}
            variant="outline"
            className="mt-6"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </>
  );
}
