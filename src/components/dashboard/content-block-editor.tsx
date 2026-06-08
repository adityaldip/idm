"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ContentBlock } from "@prisma/client";
import { saveContentBlockAction } from "@/app/(dashboard)/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTENT_BLOCK_LABELS } from "@/lib/constants";

const inputClass = "h-10 px-3";

export function ContentBlockEditor({ block }: { block: ContentBlock }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveContentBlockAction(new FormData(e.currentTarget));
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Content saved");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {CONTENT_BLOCK_LABELS[block.type] ?? block.type}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="type" value={block.type} />
          <div className="space-y-1.5">
            <Label htmlFor={`title-${block.type}`}>Title</Label>
            <Input
              id={`title-${block.type}`}
              name="title"
              className={inputClass}
              defaultValue={block.title ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`subtitle-${block.type}`}>Subtitle</Label>
            <Input
              id={`subtitle-${block.type}`}
              name="subtitle"
              className={inputClass}
              defaultValue={block.subtitle ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`body-${block.type}`}>Body</Label>
            <textarea
              id={`body-${block.type}`}
              name="body"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={block.body ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`imageUrl-${block.type}`}>Image URL</Label>
            <Input
              id={`imageUrl-${block.type}`}
              name="imageUrl"
              className={inputClass}
              defaultValue={block.imageUrl ?? ""}
            />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Block
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
