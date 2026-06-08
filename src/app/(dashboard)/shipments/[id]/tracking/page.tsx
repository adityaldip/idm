import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { TrackingUpdateForm } from "@/components/dashboard/tracking-update-form";
import { getSessionActor } from "@/lib/server-session";
import { getShipmentById } from "@/services/shipment.service";
import { prisma } from "@/lib/prisma";

interface TrackingUpdatePageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackingUpdatePage({
  params,
}: TrackingUpdatePageProps) {
  const { id } = await params;
  const actor = await getSessionActor();
  const shipment = await getShipmentById(id, actor);

  if (!shipment) notFound();

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, city: true },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Update Tracking"
        description={`${shipment.trackingNumber} — ${shipment.senderCity} → ${shipment.recipientCity}`}
        backHref={`/shipments/${id}`}
      />
      <TrackingUpdateForm
        shipmentId={id}
        currentStatus={shipment.status}
        branches={branches}
      />
    </div>
  );
}
