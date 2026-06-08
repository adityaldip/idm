"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Truck, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { VehicleStatus, VehicleType } from "@prisma/client";
import {
  saveVehicleAction,
  deleteVehicleAction,
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

export type VehicleEditItem = {
  id: string;
  plateNumber: string;
  type: VehicleType;
  brand: string | null;
  model: string | null;
  year: number | null;
  capacity: number | null;
  status: VehicleStatus;
  branchId: string | null;
  lastServiceAt: string | null;
  notes: string | null;
};

type BranchOption = { id: string; name: string; city: string };

export function VehicleFormSheet({
  item,
  branches,
}: {
  item?: VehicleEditItem;
  branches: BranchOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const lastServiceValue = item?.lastServiceAt
    ? item.lastServiceAt.slice(0, 10)
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveVehicleAction(
      new FormData(e.currentTarget),
      item?.id,
    );
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Vehicle updated" : "Vehicle created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Vehicle" : "New Vehicle"}
      description="Register fleet vehicles and assign them to branches."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Vehicle" : "Create Vehicle"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm" title="Edit">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Vehicle
          </Button>
        )
      }
    >
      <FormSection icon={Truck} title="Vehicle Info">
        <FormField id="plateNumber" label="Plate Number" required>
          <Input
            id="plateNumber"
            name="plateNumber"
            className={inputClass}
            defaultValue={item?.plateNumber}
            placeholder="B 1234 XYZ"
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="type" label="Type" required>
            <FormSelect
              id="type"
              name="type"
              defaultValue={item?.type ?? "VAN"}
              required
            >
              {(Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[]).map((t) => (
                <option key={t} value={t}>
                  {VEHICLE_TYPE_LABELS[t]}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField id="status" label="Status">
            <FormSelect
              id="status"
              name="status"
              defaultValue={item?.status ?? "AVAILABLE"}
            >
              {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map(
                (s) => (
                  <option key={s} value={s}>
                    {VEHICLE_STATUS_LABELS[s]}
                  </option>
                ),
              )}
            </FormSelect>
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="brand" label="Brand">
            <Input
              id="brand"
              name="brand"
              className={inputClass}
              defaultValue={item?.brand ?? ""}
              placeholder="e.g. Toyota"
            />
          </FormField>
          <FormField id="model" label="Model">
            <Input
              id="model"
              name="model"
              className={inputClass}
              defaultValue={item?.model ?? ""}
              placeholder="e.g. Hiace"
            />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="year" label="Year">
            <Input
              id="year"
              name="year"
              type="number"
              min={1990}
              max={2100}
              className={inputClass}
              defaultValue={item?.year ?? ""}
            />
          </FormField>
          <FormField id="capacity" label="Capacity (kg)">
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={0}
              step="0.1"
              className={inputClass}
              defaultValue={item?.capacity ?? ""}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection icon={Building2} title="Assignment">
        <FormField id="branchId" label="Branch">
          <FormSelect
            id="branchId"
            name="branchId"
            defaultValue={item?.branchId ?? ""}
          >
            <option value="">— None —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField id="lastServiceAt" label="Last Service Date">
          <Input
            id="lastServiceAt"
            name="lastServiceAt"
            type="date"
            className={inputClass}
            defaultValue={lastServiceValue}
          />
        </FormField>
        <FormField id="notes" label="Notes">
          <Input
            id="notes"
            name="notes"
            className={inputClass}
            defaultValue={item?.notes ?? ""}
            placeholder="Maintenance notes, etc."
          />
        </FormField>
      </FormSection>
    </FormSheet>
  );
}

export function DeleteVehicleButton({
  id,
  plateNumber,
}: {
  id: string;
  plateNumber: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete vehicle ${plateNumber}? This cannot be undone if the vehicle has shipments.`,
      )
    ) {
      return;
    }
    setLoading(true);
    const result = await deleteVehicleAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Vehicle deleted");
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
