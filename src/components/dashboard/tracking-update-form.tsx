"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { addTrackingAction } from "@/app/(dashboard)/shipments/actions";
import type { StatusOption } from "@/lib/status-option";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackingPhotoFields } from "@/components/dashboard/tracking-photo-fields";
import { toast } from "sonner";

type BranchOption = { id: string; name: string; city: string };

interface TrackingUpdateFormProps {
  shipmentId: string;
  currentStatus: StatusOption;
  nextStatuses: StatusOption[];
  branches: BranchOption[];
}

export function TrackingUpdateForm({
  shipmentId,
  currentStatus,
  nextStatuses,
  branches,
}: TrackingUpdateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await addTrackingAction(
      shipmentId,
      new FormData(e.currentTarget),
    );

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    toast.success("Tracking updated");
    router.push(`/shipments/${shipmentId}`);
    router.refresh();
  }

  if (nextStatuses.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          This shipment is in a terminal state ({currentStatus.label}).
          No further status updates are allowed.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Tracking Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <select
              id="status"
              name="status"
              required
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">Select status</option>
              {nextStatuses.map((status) => (
                <option key={status.code} value={status.code}>
                  {status.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Current: {currentStatus.label}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              name="location"
              required
              placeholder="e.g. Bekasi Transit Hub"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Optional notes about this update"
            />
          </div>

          <TrackingPhotoFields />

          <div className="space-y-2">
            <Label htmlFor="branchId">Branch</Label>
            <select
              id="branchId"
              name="branchId"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="">—</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update Tracking"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
