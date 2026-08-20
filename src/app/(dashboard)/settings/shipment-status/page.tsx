import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ShipmentStatusSettings } from "@/components/dashboard/shipment-status-settings";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listShipmentStatuses } from "@/services/shipment-status.service";

export default async function ShipmentStatusSettingsPage() {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "settings:write")) {
    redirect("/unauthorized");
  }

  const statuses = await listShipmentStatuses();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Status Pengiriman"
        description="Atur nama, warna, dan urutan status. Urutan di sini menentukan alur perpindahan status pengiriman."
        backHref="/settings"
      />
      <ShipmentStatusSettings statuses={statuses} />
    </div>
  );
}
