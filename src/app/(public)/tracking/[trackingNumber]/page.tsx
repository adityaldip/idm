import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackingResult } from "@/components/tracking/tracking-result";
import { getPublicTracking } from "@/services/tracking.service";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 lg:px-8">
      <TrackingResult shipment={shipment} />
    </div>
  );
}
