"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Package, User, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import type { ShipmentEditItem } from "@/lib/shipment-edit-item";
import {
  updateShipmentAction,
  deleteShipmentAction,
} from "@/app/(dashboard)/shipments/actions";
import { Button } from "@/components/ui/button";
import {
  FormSheet,
  FormSection,
  FormField,
  FormSelect,
  Input,
  inputClass,
} from "@/components/dashboard/form-sheet";
import {
  ShipmentFleetFields,
  type ShipmentDriverOption,
  type ShipmentVehicleOption,
} from "@/components/dashboard/shipment-fleet-fields";

type CustomerOption = { id: string; code: string; name: string };
type BranchOption = { id: string; name: string; city: string };
type OfferingOption = { id: string; name: string };

export function EditShipmentSheet({
  shipment,
  customers,
  branches,
  offerings,
  drivers,
  vehicles,
}: {
  shipment: ShipmentEditItem;
  customers: CustomerOption[];
  branches: BranchOption[];
  offerings: OfferingOption[];
  drivers: ShipmentDriverOption[];
  vehicles: ShipmentVehicleOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await updateShipmentAction(
      shipment.id,
      new FormData(e.currentTarget),
    );
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Shipment updated");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title="Edit Shipment"
      description={shipment.trackingNumber}
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      trigger={
        <Button variant="ghost" size="sm" title="Edit">
          <Pencil className="size-4" />
        </Button>
      }
    >
      <FormSection icon={Package} title="Shipment Details">
        <FormField id="customerId" label="Customer" required>
          <FormSelect
            id="customerId"
            name="customerId"
            defaultValue={shipment.customerId}
            required
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField id="serviceOfferingId" label="Service" required>
          <FormSelect
            id="serviceOfferingId"
            name="serviceOfferingId"
            defaultValue={shipment.serviceOfferingId}
            required
          >
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="packageCount" label="Package Count">
            <Input
              id="packageCount"
              name="packageCount"
              type="number"
              min={1}
              className={inputClass}
              defaultValue={shipment.packageCount}
            />
          </FormField>
          <FormField id="weight" label="Weight (kg)">
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              min={0}
              className={inputClass}
              defaultValue={shipment.weight ?? ""}
            />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="shippingCost" label="Shipping Cost (IDR)">
            <Input
              id="shippingCost"
              name="shippingCost"
              type="number"
              min={0}
              className={inputClass}
              defaultValue={shipment.shippingCost ?? ""}
            />
          </FormField>
          <FormField id="description" label="Description">
            <Input
              id="description"
              name="description"
              className={inputClass}
              defaultValue={shipment.description ?? ""}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection icon={User} title="Sender">
        <FormField id="senderName" label="Name" required>
          <Input
            id="senderName"
            name="senderName"
            className={inputClass}
            defaultValue={shipment.senderName}
            required
          />
        </FormField>
        <FormField id="senderPhone" label="Phone" required>
          <Input
            id="senderPhone"
            name="senderPhone"
            className={inputClass}
            defaultValue={shipment.senderPhone}
            required
          />
        </FormField>
        <FormField id="senderAddress" label="Address" required>
          <Input
            id="senderAddress"
            name="senderAddress"
            className={inputClass}
            defaultValue={shipment.senderAddress}
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="senderCity" label="City" required>
            <Input
              id="senderCity"
              name="senderCity"
              className={inputClass}
              defaultValue={shipment.senderCity}
              required
            />
          </FormField>
          <FormField id="originBranchId" label="Origin Branch">
            <FormSelect
              id="originBranchId"
              name="originBranchId"
              defaultValue={shipment.originBranchId ?? ""}
            >
              <option value="">— None —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </FormSection>

      <FormSection icon={MapPin} title="Recipient">
        <FormField id="recipientName" label="Name" required>
          <Input
            id="recipientName"
            name="recipientName"
            className={inputClass}
            defaultValue={shipment.recipientName}
            required
          />
        </FormField>
        <FormField id="recipientPhone" label="Phone" required>
          <Input
            id="recipientPhone"
            name="recipientPhone"
            className={inputClass}
            defaultValue={shipment.recipientPhone}
            required
          />
        </FormField>
        <FormField id="recipientAddress" label="Address" required>
          <Input
            id="recipientAddress"
            name="recipientAddress"
            className={inputClass}
            defaultValue={shipment.recipientAddress}
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="recipientCity" label="City" required>
            <Input
              id="recipientCity"
              name="recipientCity"
              className={inputClass}
              defaultValue={shipment.recipientCity}
              required
            />
          </FormField>
          <FormField id="destinationBranchId" label="Destination Branch">
            <FormSelect
              id="destinationBranchId"
              name="destinationBranchId"
              defaultValue={shipment.destinationBranchId ?? ""}
            >
              <option value="">— None —</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
        <FormField id="notes" label="Notes">
          <Input
            id="notes"
            name="notes"
            className={inputClass}
            defaultValue={shipment.notes ?? ""}
          />
        </FormField>
      </FormSection>

      <FormSection icon={Truck} title="Fleet Assignment">
        <ShipmentFleetFields
          drivers={drivers}
          vehicles={vehicles}
          defaultDriverId={shipment.driverId ?? ""}
          defaultVehicleId={shipment.vehicleId ?? ""}
        />
      </FormSection>
    </FormSheet>
  );
}

export function DeleteShipmentButton({
  id,
  trackingNumber,
}: {
  id: string;
  trackingNumber: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete shipment ${trackingNumber}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    const result = await deleteShipmentAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Shipment deleted");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      title="Delete"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
