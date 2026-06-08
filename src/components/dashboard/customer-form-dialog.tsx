"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Customer } from "@prisma/client";
import {
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from "@/app/(dashboard)/customers/actions";
import { Button } from "@/components/ui/button";
import {
  FormSheet,
  FormSection,
  FormField,
  FormTextarea,
  Input,
  inputClass,
} from "@/components/dashboard/form-sheet";

type CustomerItem = Pick<
  Customer,
  | "id"
  | "code"
  | "name"
  | "email"
  | "phone"
  | "company"
  | "address"
  | "city"
  | "province"
  | "notes"
  | "isActive"
>;

export function CustomerFormDialog({ item }: { item?: CustomerItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = item
      ? await updateCustomerAction(item.id, new FormData(e.currentTarget))
      : await createCustomerAction(new FormData(e.currentTarget));
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(item ? "Customer updated" : "Customer created");
    setOpen(false);
    if (!item) setFormKey((k) => k + 1);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Customer" : "New Customer"}
      description={
        item
          ? item.code
          : "Add a customer to link shipments and track their delivery history."
      }
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Save Changes" : "Create Customer"}
      formKey={item ? undefined : formKey}
      trigger={
        item ? (
          <Button variant="ghost" size="sm" title="Edit">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            New Customer
          </Button>
        )
      }
    >
      <FormSection icon={User} title="Contact Information">
        {item && (
          <FormField id="code-display" label="Customer Code">
            <Input
              id="code-display"
              className={inputClass}
              defaultValue={item.code}
              readOnly
            />
          </FormField>
        )}
        <FormField id="name" label="Full Name" required>
          <Input
            id="name"
            name="name"
            required
            placeholder="e.g. Andi Wijaya"
            className={inputClass}
            defaultValue={item?.name}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label="Phone" required>
            <Input
              id="phone"
              name="phone"
              required
              type="tel"
              placeholder="+62 812 3456 7890"
              className={inputClass}
              defaultValue={item?.phone}
            />
          </FormField>
          <FormField id="email" label="Email">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="customer@company.com"
              className={inputClass}
              defaultValue={item?.email ?? ""}
            />
          </FormField>
        </div>
        {item && (
          <FormField id="isActive" label="Status">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={item.isActive}
                className="size-4 rounded border-input"
              />
              Active customer
            </label>
          </FormField>
        )}
      </FormSection>

      <FormSection icon={Building2} title="Company & Location">
        <FormField id="company" label="Company">
          <Input
            id="company"
            name="company"
            placeholder="PT / CV name (optional)"
            className={inputClass}
            defaultValue={item?.company ?? ""}
          />
        </FormField>
        <FormField id="address" label="Address">
          <Input
            id="address"
            name="address"
            placeholder="Street address"
            className={inputClass}
            defaultValue={item?.address ?? ""}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="city" label="City">
            <Input
              id="city"
              name="city"
              placeholder="e.g. Semarang"
              className={inputClass}
              defaultValue={item?.city ?? ""}
            />
          </FormField>
          <FormField id="province" label="Province">
            <Input
              id="province"
              name="province"
              placeholder="e.g. Jawa Tengah"
              className={inputClass}
              defaultValue={item?.province ?? ""}
            />
          </FormField>
        </div>
        <FormField id="notes" label="Notes">
          <FormTextarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Internal notes about this customer..."
            defaultValue={item?.notes ?? ""}
          />
        </FormField>
      </FormSection>
    </FormSheet>
  );
}

export function DeleteCustomerButton({
  id,
  code,
}: {
  id: string;
  code: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete customer ${code}? This cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteCustomerAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Customer deleted");
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
