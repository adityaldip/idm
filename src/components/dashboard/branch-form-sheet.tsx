"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Building2, MapPin, Phone, Settings2 } from "lucide-react";
import { toast } from "sonner";
import type { Branch } from "@prisma/client";
import { saveBranchAction, deleteBranchAction } from "@/app/(dashboard)/branches/actions";
import { Button } from "@/components/ui/button";
import {
  FormSheet,
  FormSection,
  FormField,
  FormCheckbox,
  Input,
  inputClass,
} from "@/components/dashboard/form-sheet";

type BranchItem = Pick<
  Branch,
  | "id"
  | "code"
  | "name"
  | "address"
  | "city"
  | "province"
  | "postalCode"
  | "phone"
  | "email"
  | "latitude"
  | "longitude"
  | "isActive"
  | "isHeadquarters"
>;

export function BranchFormSheet({ item }: { item?: BranchItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveBranchAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Branch updated" : "Branch created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Branch" : "New Branch"}
      description="Manage office locations used for staff, vehicles, and shipments."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Branch" : "Create Branch"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Branch
          </Button>
        )
      }
    >
      <FormSection icon={Building2} title="Branch Info">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="code" label="Branch Code" required hint="Unique code, e.g. SMG-01">
            <Input
              id="code"
              name="code"
              className={inputClass}
              defaultValue={item?.code}
              placeholder="SMG-01"
              required
              readOnly={!!item}
            />
          </FormField>
          <FormField id="name" label="Branch Name" required>
            <Input
              id="name"
              name="name"
              className={inputClass}
              defaultValue={item?.name}
              placeholder="e.g. Semarang HQ"
              required
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection icon={MapPin} title="Location">
        <FormField id="address" label="Address" required>
          <Input
            id="address"
            name="address"
            className={inputClass}
            defaultValue={item?.address}
            placeholder="Street address"
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="city" label="City" required>
            <Input
              id="city"
              name="city"
              className={inputClass}
              defaultValue={item?.city}
              placeholder="e.g. Semarang"
              required
            />
          </FormField>
          <FormField id="province" label="Province" required>
            <Input
              id="province"
              name="province"
              className={inputClass}
              defaultValue={item?.province}
              placeholder="e.g. Jawa Tengah"
              required
            />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="postalCode" label="Postal Code">
            <Input
              id="postalCode"
              name="postalCode"
              className={inputClass}
              defaultValue={item?.postalCode ?? ""}
              placeholder="50272"
            />
          </FormField>
          <FormField id="latitude" label="Latitude">
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              className={inputClass}
              defaultValue={item?.latitude ?? ""}
              placeholder="-6.99"
            />
          </FormField>
          <FormField id="longitude" label="Longitude">
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              className={inputClass}
              defaultValue={item?.longitude ?? ""}
              placeholder="110.42"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection icon={Phone} title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label="Phone" required>
            <Input
              id="phone"
              name="phone"
              type="tel"
              className={inputClass}
              defaultValue={item?.phone}
              placeholder="(024) 7673 7893"
              required
            />
          </FormField>
          <FormField id="email" label="Email">
            <Input
              id="email"
              name="email"
              type="email"
              className={inputClass}
              defaultValue={item?.email ?? ""}
              placeholder="branch@idm.co.id"
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection icon={Settings2} title="Settings">
        <FormCheckbox
          id="isHeadquarters"
          name="isHeadquarters"
          label="Headquarters"
          description="Only one branch can be HQ. Setting this unmarks the current HQ."
          defaultChecked={item?.isHeadquarters ?? false}
        />
        {item && (
          <FormCheckbox
            id="isActive"
            name="isActive"
            label="Branch active"
            description="Inactive branches are hidden from new assignments."
            defaultChecked={item.isActive}
          />
        )}
      </FormSection>
    </FormSheet>
  );
}

export function DeleteBranchButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete branch "${name}"? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteBranchAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Branch deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
