import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, MapPin, Package, Truck } from "lucide-react";
import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { getShipmentById } from "@/services/shipment.service";
import { ITEM_UNIT_LABELS } from "@/lib/constants";

interface ShipmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShipmentDetailPage({
  params,
}: ShipmentDetailPageProps) {
  const { id } = await params;
  const actor = await getSessionActor();
  const canTrack = hasPermission(actor.role, "tracking:write");
  const shipment = await getShipmentById(id, actor);

  if (!shipment) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={shipment.trackingNumber}
        description={`${shipment.senderCity} → ${shipment.recipientCity}`}
        backHref="/shipments"
        actions={
          <>
            <Button
              nativeButton={false}
              render={
                <Link
                  href={`/tracking/${shipment.trackingNumber}`}
                  target="_blank"
                />
              }
              variant="outline"
              size="sm"
            >
              Public Tracking
            </Button>
            {canTrack && (
              <Button
                nativeButton={false}
                render={<Link href={`/shipments/${id}/tracking`} />}
                size="sm"
              >
                <Truck className="size-4" />
                Update Status
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Package className="size-8 text-primary/70" />
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={shipment.status} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Service</p>
            <p className="font-medium">
              {shipment.serviceOffering?.name ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Current Location</p>
            <p className="font-medium">
              {shipment.currentLocation ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Est. Delivery</p>
            <p className="font-medium">
              {shipment.estimatedDelivery
                ? format(shipment.estimatedDelivery, "dd MMM yyyy")
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {(shipment.driver || shipment.vehicle) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4" />
              Fleet Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            {shipment.driver && (
              <div>
                <span className="text-muted-foreground">Driver: </span>
                {shipment.driver.name} ({shipment.driver.code})
              </div>
            )}
            {shipment.vehicle && (
              <div>
                <span className="text-muted-foreground">Vehicle: </span>
                {shipment.vehicle.plateNumber}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{shipment.senderName}</p>
            <p className="text-muted-foreground">{shipment.senderPhone}</p>
            <p>{shipment.senderAddress}</p>
            <p>{shipment.senderCity}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recipient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{shipment.recipientName}</p>
            <p className="text-muted-foreground">{shipment.recipientPhone}</p>
            <p>{shipment.recipientAddress}</p>
            <p>{shipment.recipientCity}</p>
          </CardContent>
        </Card>
      </div>

      {shipment.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="size-4" />
              Daftar Barang
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/40 text-left">
                    <th className="px-6 py-2 font-medium">Nama Barang</th>
                    <th className="px-6 py-2 text-right font-medium">Qty</th>
                    <th className="px-6 py-2 font-medium">Satuan</th>
                    <th className="px-6 py-2 text-right font-medium">
                      Berat (kg)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="px-6 py-2">{item.name}</td>
                      <td className="px-6 py-2 text-right">
                        {Number(item.quantity).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-2">
                        {ITEM_UNIT_LABELS[item.unit]}
                      </td>
                      <td className="px-6 py-2 text-right text-muted-foreground">
                        {item.weightKg != null
                          ? item.weightKg.toLocaleString("id-ID")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tracking History</CardTitle>
        </CardHeader>
        <CardContent>
          {shipment.trackingHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tracking events yet.</p>
          ) : (
            <div className="space-y-4">
              {[...shipment.trackingHistory].reverse().map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`}
                    />
                    {i < shipment.trackingHistory.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={event.status} />
                      <span className="text-xs text-muted-foreground">
                        {format(event.timestamp, "dd MMM yyyy, HH:mm")}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      {event.location}
                    </p>
                    {event.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    {event.branch && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {event.branch.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Customer: </span>
            {shipment.customer.name} ({shipment.customer.code})
          </div>
          {shipment.poNumber && (
            <div>
              <span className="text-muted-foreground">PO Number: </span>
              {shipment.poNumber}
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Packages: </span>
            {shipment.packageCount}
          </div>
          {shipment.weight && (
            <div>
              <span className="text-muted-foreground">Weight: </span>
              {shipment.weight} kg
            </div>
          )}
          {shipment.totalCost && (
            <div>
              <span className="text-muted-foreground">Total Cost: </span>
              Rp {Number(shipment.totalCost).toLocaleString("id-ID")}
            </div>
          )}
          {shipment.originBranch && (
            <div>
              <span className="text-muted-foreground">Origin: </span>
              {shipment.originBranch.name}
            </div>
          )}
          {shipment.destinationBranch && (
            <div>
              <span className="text-muted-foreground">Destination: </span>
              {shipment.destinationBranch.name}
            </div>
          )}
          {shipment.driver && (
            <div>
              <span className="text-muted-foreground">Driver: </span>
              {shipment.driver.name} ({shipment.driver.code})
            </div>
          )}
          {shipment.vehicle && (
            <div>
              <span className="text-muted-foreground">Vehicle: </span>
              {shipment.vehicle.plateNumber}
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Created: </span>
            {format(shipment.createdAt, "dd MMM yyyy HH:mm")}
          </div>
          {shipment.description && (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Description: </span>
              {shipment.description}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
