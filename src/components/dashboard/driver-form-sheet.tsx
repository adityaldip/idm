"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, User, IdCard, Truck } from "lucide-react";
import { toast } from "sonner";
import type { Driver, DriverStatus } from "@prisma/client";
import {
  saveDriverAction,
  deleteDriverAction,
} from "@/app/(dashboard)/fleet/actions";
import { Button } from "@/components/ui/button";
import {
  FormSheet,
  FormSection,
  FormField,
  FormSelect,
  Input,
  inputClass,
} from "@/components/dashboard/form-sheet";

const DRIVER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  INACTIVE: "Inactive",
};

type DriverItem = Pick<
  Driver,
  "id" | "code" | "name" | "phone" | "licenseNumber" | "licenseExpiry" | "status" | "photoUrl"
> & { vehicle?: { id: string; plateNumber: string } | null };

type VehicleOption = { id: string; plateNumber: string };

export function DriverFormSheet({
  item,
  vehicles,
}: {
  item?: DriverItem;
  vehicles: VehicleOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const licenseValue = item?.licenseExpiry
    ? new Date(item.licenseExpiry).toISOString().slice(0, 10)
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveDriverAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Driver updated" : "Driver created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Driver" : "New Driver"}
      description="Register drivers and assign them to fleet vehicles."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Driver" : "Create Driver"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Driver
          </Button>
        )
      }
    >
      <FormSection icon={User} title="Personal Info">
        <FormField id="code" label="Driver Code" required hint="Unique identifier, e.g. DRV-001">
          <Input
            id="code"
            name="code"
            className={inputClass}
            defaultValue={item?.code}
            placeholder="DRV-001"
            required
            readOnly={!!item}
          />
        </FormField>
        <FormField id="name" label="Full Name" required>
          <Input
            id="name"
            name="name"
            className={inputClass}
            defaultValue={item?.name}
            placeholder="e.g. Andi Wijaya"
            required
          />
        </FormField>
        <FormField id="phone" label="Phone" required>
          <Input
            id="phone"
            name="phone"
            type="tel"
            className={inputClass}
            defaultValue={item?.phone}
            placeholder="+62 812 3456 7890"
            required
          />
        </FormField>
        <FormField id="photoUrl" label="Photo URL">
          <Input
            id="photoUrl"
            name="photoUrl"
            className={inputClass}
            defaultValue={item?.photoUrl ?? ""}
            placeholder="https://..."
          />
        </FormField>
      </FormSection>

      <FormSection icon={IdCard} title="License">
        <FormField id="licenseNumber" label="License Number" required>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            className={inputClass}
            defaultValue={item?.licenseNumber}
            placeholder="SIM / license number"
            required
          />
        </FormField>
        <FormField id="licenseExpiry" label="License Expiry">
          <Input
            id="licenseExpiry"
            name="licenseExpiry"
            type="date"
            className={inputClass}
            defaultValue={licenseValue}
          />
        </FormField>
      </FormSection>

      <FormSection icon={Truck} title="Assignment">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="status" label="Status">
            <FormSelect id="status" name="status" defaultValue={item?.status ?? "ACTIVE"}>
              {(Object.keys(DRIVER_STATUS_LABELS) as DriverStatus[]).map((s) => (
                <option key={s} value={s}>
                  {DRIVER_STATUS_LABELS[s]}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField id="vehicleId" label="Assigned Vehicle">
            <FormSelect id="vehicleId" name="vehicleId" defaultValue={item?.vehicle?.id ?? ""}>
              <option value="">— None —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>
      </FormSection>
    </FormSheet>
  );
}

export function DeleteDriverButton({
  id,
  code,
}: {
  id: string;
  code: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete driver ${code}?`)) return;
    setLoading(true);
    const result = await deleteDriverAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Driver deleted");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      title="Delete"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="size-4" />
    </Button>
  );
}
