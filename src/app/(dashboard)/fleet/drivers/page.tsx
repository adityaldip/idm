import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  DriverFormSheet,
  DeleteDriverButton,
} from "@/components/dashboard/driver-form-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listDrivers, listVehicles } from "@/services/fleet.service";

const DRIVER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  INACTIVE: "Inactive",
};

export default async function FleetDriversPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "fleet:write");

  const [{ items }, { items: vehicles }] = await Promise.all([
    listDrivers({ page: 1, limit: 50, sortOrder: "desc" }),
    listVehicles({ page: 1, limit: 100, sortOrder: "asc" }),
  ]);

  const vehicleOptions = vehicles.map((v) => ({
    id: v.id,
    plateNumber: v.plateNumber,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet — Drivers"
        description="Manage drivers and vehicle assignments."
        actions={
          canWrite ? <DriverFormSheet vehicles={vehicleOptions} /> : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No drivers registered"
          description="Add drivers to assign them to shipments."
          action={
            canWrite ? (
              <DriverFormSheet vehicles={vehicleOptions} />
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">License</th>
                    <th className="px-4 py-3 font-medium">Vehicle</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Shipments</th>
                    {canWrite && <th className="px-4 py-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((driver) => (
                    <tr
                      key={driver.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{driver.code}</td>
                      <td className="px-4 py-3">{driver.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {driver.phone}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div>{driver.licenseNumber}</div>
                        {driver.licenseExpiry && (
                          <div className="text-xs">
                            exp. {format(driver.licenseExpiry, "dd MMM yyyy")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {driver.vehicle?.plateNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {DRIVER_STATUS_LABELS[driver.status] ?? driver.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{driver._count.shipments}</td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <DriverFormSheet
                              item={driver}
                              vehicles={vehicleOptions}
                            />
                            <DeleteDriverButton
                              id={driver.id}
                              code={driver.code}
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
