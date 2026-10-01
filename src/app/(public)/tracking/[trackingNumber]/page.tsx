import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackingHero } from "@/components/tracking/tracking-hero";
import { TrackingResult } from "@/components/tracking/tracking-result";
import { TrackingSearch } from "@/components/tracking/tracking-search";
import { getPublicTracking } from "@/services/tracking.service";
import { getShipmentStatuses } from "@/services/shipment-status.service";
import { trackingJourney } from "@/lib/shipment-status";

interface TrackingPageProps {
  params: Promise<{ trackingNumber: string }>;
}

export async function generateMetadata({
  params,
}: TrackingPageProps): Promise<Metadata> {
  const { trackingNumber } = await params;
  return {
    title: `Tracking ${trackingNumber}`,
    robots: { index: false },
  };
}

export default async function TrackingResultPage({ params }: TrackingPageProps) {
  const { trackingNumber } = await params;
  const shipment = await getPublicTracking(trackingNumber);

  if (!shipment) {
    notFound();
  }

  const journey = trackingJourney(
    shipment.statusId,
    shipment.trackingHistory.map((e) => e.status.id),
    // Only the fields the client stepper renders.
    (await getShipmentStatuses()).map((d) => ({
      id: d.id,
      code: d.code,
      label: d.label,
      color: d.color,
      sortOrder: d.sortOrder,
      isInitial: d.isInitial,
      isFinal: d.isFinal,
      allowFromAny: d.allowFromAny,
      isActive: d.isActive,
    })),
  );

  return (
    <>
      <TrackingHero
        title="Status Pengiriman"
        description="Lacak pengiriman lain dengan nomor resi atau nomor PO."
      >
        <TrackingSearch />
      </TrackingHero>
      <div className="relative mx-auto -mt-16 max-w-4xl px-4 pb-20 md:px-6 lg:px-8">
        <TrackingResult shipment={shipment} journey={journey} />
      </div>
    </>
  );
}
