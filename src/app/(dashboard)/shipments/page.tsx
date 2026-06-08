import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { ShipmentStatus } from "@prisma/client";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ExportButtons } from "@/components/dashboard/export-buttons";
import { ShipmentsFilters } from "@/components/dashboard/shipments-filters";
import {
  EditShipmentSheet,
  DeleteShipmentButton,
} from "@/components/dashboard/shipment-form-sheet";
import { ShipmentStatusSheet } from "@/components/dashboard/shipment-status-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listShipments } from "@/services/shipment.service";
import { listActiveServiceOfferings } from "@/services/cms.service";
import { listFleetForAssignment } from "@/services/fleet.service";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { toShipmentEditItem } from "@/lib/shipment-edit-item";

interface ShipmentsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    branchId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

function toFilterDate(value: string | undefined, endOfDay = false) {
  if (!value) return undefined;
  const d = new Date(value);
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default async function ShipmentsPage({ searchParams }: ShipmentsPageProps) {
  const params = await searchParams;
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "shipments:write");
  const canTrack = hasPermission(actor.role, "tracking:write");
  const page = Number(params.page ?? 1);

  const filterBranches =
    canWrite || canTrack
      ? await prisma.branch.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, city: true },
        })
      : [];

  const { items, meta } = await listShipments(
    {
      page,
      limit: 20,
      search: params.search,
      status: params.status as ShipmentStatus | undefined,
      branchId: params.branchId,
      dateFrom: toFilterDate(params.dateFrom),
      dateTo: toFilterDate(params.dateTo, true),
      sortOrder: "desc",
    },
    actor,
  );

  const [customers, branches, offerings, fleet] = await Promise.all([
    canWrite
      ? prisma.customer.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, code: true, name: true },
        })
      : [],
    filterBranches,
    canWrite ? listActiveServiceOfferings() : [],
    canWrite ? listFleetForAssignment() : { drivers: [], vehicles: [] },
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Management"
        description="Create, view, and manage all shipments."
        actions={
          canWrite ? (
            <>
              <ExportButtons />
              <Button
                nativeButton={false}
                render={<Link href="/shipments/new" />}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="size-4" />
                New Shipment
              </Button>
            </>
          ) : (
            <ExportButtons />
          )
        }
      />

      <Suspense>
        <ShipmentsFilters branches={filterBranches} />
      </Suspense>

      {items.length === 0 ? (
        <EmptyState
          title="No shipments found"
          description="Create your first shipment or adjust your filters."
          action={
            canWrite ? (
              <Button
                nativeButton={false}
                render={<Link href="/shipments/new" />}
              >
                <Plus className="size-4" />
                New Shipment
              </Button>
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
                    <th className="px-4 py-3 font-medium">Tracking #</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Fleet</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    {(canWrite || canTrack) && (
                      <th className="px-4 py-3 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/shipments/${shipment.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {shipment.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-4 py-3">{shipment.customer.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {shipment.senderCity} → {shipment.recipientCity}
                      </td>
                      <td className="px-4 py-3">
                        {shipment.serviceOffering?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {shipment.driver
                          ? `${shipment.driver.code}`
                          : shipment.vehicle
                            ? shipment.vehicle.plateNumber
                            : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(shipment.createdAt, "dd MMM yyyy")}
                      </td>
                      {(canWrite || canTrack) && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {canTrack && (
                              <ShipmentStatusSheet
                                shipmentId={shipment.id}
                                trackingNumber={shipment.trackingNumber}
                                currentStatus={shipment.status}
                                branches={branches}
                              />
                            )}
                            {canWrite && (
                              <EditShipmentSheet
                                shipment={toShipmentEditItem(shipment)}
                                customers={customers}
                                branches={branches}
                                offerings={offerings}
                                drivers={fleet.drivers}
                                vehicles={fleet.vehicles}
                              />
                            )}
                            {canWrite && (
                              <DeleteShipmentButton
                                id={shipment.id}
                                trackingNumber={shipment.trackingNumber}
                              />
                            )}
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

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </span>
          <div className="flex gap-2">
            {meta.page > 1 && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/shipments?${new URLSearchParams({
                      ...(params.search && { search: params.search }),
                      ...(params.status && { status: params.status }),
                      page: String(meta.page - 1),
                    }).toString()}`}
                  />
                }
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
            )}
            {meta.page < meta.totalPages && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/shipments?${new URLSearchParams({
                      ...(params.search && { search: params.search }),
                      ...(params.status && { status: params.status }),
                      page: String(meta.page + 1),
                    }).toString()}`}
                  />
                }
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
