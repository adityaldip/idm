import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { TrackingSearch } from "@/components/tracking/tracking-search";

export const metadata: Metadata = {
  title: "Shipment Tracking",
  description: "Track your IDM shipment in real-time with your tracking number.",
};

export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
      <div className="mb-6 flex justify-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/15 text-secondary shadow-sm">
          <PackageSearch className="size-7" />
        </div>
      </div>
      <TrackingSearch />
    </div>
  );
}
