"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { markInboxReadAction } from "@/app/(dashboard)/admin-actions";
import { Button } from "@/components/ui/button";

export function MarkReadButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkRead() {
    setLoading(true);
    const result = await markInboxReadAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Marked as read");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkRead} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <Check className="mr-1 size-4" />
          Mark read
        </>
      )}
    </Button>
  );
}
