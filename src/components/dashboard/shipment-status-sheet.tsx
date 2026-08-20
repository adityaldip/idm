"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Route } from "lucide-react";
import { toast } from "sonner";
import { addTrackingAction } from "@/app/(dashboard)/shipments/actions";
import type { StatusOption } from "@/lib/status-option";
import { Button } from "@/components/ui/button";
import {
  FormSheet,
  FormSection,
  FormField,
  FormSelect,
  Input,
  inputClass,
} from "@/components/dashboard/form-sheet";

type BranchOption = { id: string; name: string; city: string };

export function ShipmentStatusSheet({
  shipmentId,
  trackingNumber,
  currentStatus,
  nextStatuses,
  branches,
}: {
  shipmentId: string;
  trackingNumber: string;
  currentStatus: StatusOption;
  nextStatuses: StatusOption[];
  branches: BranchOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (nextStatuses.length === 0) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await addTrackingAction(
      shipmentId,
      new FormData(e.currentTarget),
    );
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Status updated");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title="Update Status"
      description={trackingNumber}
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel="Update Status"
      trigger={
        <Button variant="ghost" size="sm" title="Update status">
          <Route className="size-4" />
        </Button>
      }
    >
      <FormSection icon={Route} title="Status Update">
        <p className="text-sm text-muted-foreground">
          Current:{" "}
          <span className="font-medium text-foreground">
            {currentStatus.label}
          </span>
        </p>
        <FormField id="status" label="New Status" required>
          <FormSelect id="status" name="status" defaultValue="" required>
            <option value="" disabled>
              Select next status
            </option>
            {nextStatuses.map((status) => (
              <option key={status.code} value={status.code}>
                {status.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
        <FormField id="location" label="Location" required>
          <Input
            id="location"
            name="location"
            className={inputClass}
            placeholder="e.g. Bekasi Transit Hub"
            required
          />
        </FormField>
        <FormField id="description" label="Notes">
          <Input
            id="description"
            name="description"
            className={inputClass}
            placeholder="Optional update notes"
          />
        </FormField>
        <FormField id="branchId" label="Branch">
          <FormSelect id="branchId" name="branchId" defaultValue="">
            <option value="">— None —</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </FormSelect>
        </FormField>
      </FormSection>
    </FormSheet>
  );
}
