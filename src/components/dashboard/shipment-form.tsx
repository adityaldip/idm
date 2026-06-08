"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createShipmentAction } from "@/app/(dashboard)/shipments/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShipmentFleetFields,
  type ShipmentDriverOption,
  type ShipmentVehicleOption,
} from "@/components/dashboard/shipment-fleet-fields";

type CustomerOption = { id: string; code: string; name: string };
type BranchOption = { id: string; code: string; name: string; city: string };
type OfferingOption = { id: string; name: string };

interface ShipmentFormProps {
  customers: CustomerOption[];
  branches: BranchOption[];
  offerings: OfferingOption[];
  drivers: ShipmentDriverOption[];
  vehicles: ShipmentVehicleOption[];
}

export function ShipmentForm({
  customers,
  branches,
  offerings,
  drivers,
  vehicles,
}: ShipmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const defaultOfferingId = offerings[0]?.id ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createShipmentAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.success && result.id) {
      toast.success("Shipment created");
      router.push(`/shipments/${result.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Shipment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="customerId">Customer *</Label>
            <select
              id="customerId"
              name="customerId"
              required
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceOfferingId">Service *</Label>
            <select
              id="serviceOfferingId"
              name="serviceOfferingId"
              required
              defaultValue={defaultOfferingId}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              {offerings.map((offering) => (
                <option key={offering.id} value={offering.id}>
                  {offering.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageCount">Package Count</Label>
            <Input
              id="packageCount"
              name="packageCount"
              type="number"
              min={1}
              defaultValue={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" name="weight" type="number" step="0.1" min={0} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCost">Shipping Cost (IDR)</Label>
            <Input
              id="shippingCost"
              name="shippingCost"
              type="number"
              min={0}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Package Description</Label>
            <Input id="description" name="description" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sender</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="senderName">Name *</Label>
            <Input id="senderName" name="senderName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderPhone">Phone *</Label>
            <Input id="senderPhone" name="senderPhone" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="senderAddress">Address *</Label>
            <Input id="senderAddress" name="senderAddress" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderCity">City *</Label>
            <Input id="senderCity" name="senderCity" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originBranchId">Origin Branch</Label>
            <select
              id="originBranchId"
              name="originBranchId"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">— None —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentFleetFields drivers={drivers} vehicles={vehicles} />
          <p className="mt-3 text-xs text-muted-foreground">
            Optional. Assign a driver and vehicle for pickup or delivery.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recipient</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Name *</Label>
            <Input id="recipientName" name="recipientName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientPhone">Phone *</Label>
            <Input id="recipientPhone" name="recipientPhone" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="recipientAddress">Address *</Label>
            <Input id="recipientAddress" name="recipientAddress" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientCity">City *</Label>
            <Input id="recipientCity" name="recipientCity" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destinationBranchId">Destination Branch</Label>
            <select
              id="destinationBranchId"
              name="destinationBranchId"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">— None —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground"
          disabled={loading || offerings.length === 0}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Creating...
            </>
          ) : (
            "Create Shipment"
          )}
        </Button>
      </div>
    </form>
  );
}
