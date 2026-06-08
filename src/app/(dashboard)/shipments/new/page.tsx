import { PageHeader } from "@/components/dashboard/page-header";
import { ShipmentForm } from "@/components/dashboard/shipment-form";
import { prisma } from "@/lib/prisma";
import { listActiveServiceOfferings } from "@/services/cms.service";
import { listFleetForAssignment } from "@/services/fleet.service";

export default async function NewShipmentPage() {
  const [customers, branches, offerings, fleet] = await Promise.all([
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, code: true, name: true, city: true },
    }),
    listActiveServiceOfferings(),
    listFleetForAssignment(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Shipment"
        description="Create a new shipment with auto-generated tracking number."
        backHref="/shipments"
      />
      {offerings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No active services found. Add a service under{" "}
          <a href="/offerings" className="text-primary hover:underline">
            Services
          </a>{" "}
          before creating shipments.
        </p>
      ) : (
        <ShipmentForm
          customers={customers}
          branches={branches}
          offerings={offerings}
          drivers={fleet.drivers}
          vehicles={fleet.vehicles}
        />
      )}
    </div>
  );
}
