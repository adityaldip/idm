import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  VehicleFormSheet,
  DeleteVehicleButton,
  type VehicleEditItem,
} from "@/components/dashboard/vehicle-form-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listVehicles } from "@/services/fleet.service";
import { prisma } from "@/lib/prisma";

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  MOTORCYCLE: "Motorcycle",
  VAN: "Van",
  TRUCK: "Truck",
  CONTAINER: "Container",
};

const VEHICLE_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  IN_USE: "In Use",
  MAINTENANCE: "Maintenance",
  RETIRED: "Retired",
};

function toVehicleEditItem(vehicle: {
  id: string;
  plateNumber: string;
  type: VehicleEditItem["type"];
  brand: string | null;
  model: string | null;
  year: number | null;
  capacity: number | null;
  status: VehicleEditItem["status"];
  branchId: string | null;
  lastServiceAt: Date | null;
  notes: string | null;
}): VehicleEditItem {
  return {
    id: vehicle.id,
    plateNumber: vehicle.plateNumber,
    type: vehicle.type,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    capacity: vehicle.capacity,
    status: vehicle.status,
    branchId: vehicle.branchId,
    lastServiceAt: vehicle.lastServiceAt?.toISOString() ?? null,
    notes: vehicle.notes,
  };
}

export default async function FleetVehiclesPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "fleet:write");

  const [{ items }, branches] = await Promise.all([
    listVehicles({ page: 1, limit: 50, sortOrder: "desc" }),
    canWrite
      ? prisma.branch.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, city: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet — Vehicles"
        description="Manage delivery vehicles and their assignments."
        actions={canWrite ? <VehicleFormSheet branches={branches} /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No vehicles registered"
          description="Add vehicles to assign drivers and shipments."
          action={
            canWrite ? <VehicleFormSheet branches={branches} /> : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Plate</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Vehicle</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Drivers</th>
                    {canWrite && <th className="px-4 py-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        {vehicle.plateNumber}
                      </td>
                      <td className="px-4 py-3">
                        {VEHICLE_TYPE_LABELS[vehicle.type] ?? vehicle.type}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {[vehicle.brand, vehicle.model].filter(Boolean).join(" ") ||
                          "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {vehicle.branch?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {VEHICLE_STATUS_LABELS[vehicle.status] ?? vehicle.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{vehicle._count.drivers}</td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <VehicleFormSheet
                              item={toVehicleEditItem(vehicle)}
                              branches={branches}
                            />
                            <DeleteVehicleButton
                              id={vehicle.id}
                              plateNumber={vehicle.plateNumber}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
