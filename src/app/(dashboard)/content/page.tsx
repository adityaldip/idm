import { PageHeader } from "@/components/dashboard/page-header";
import { ContentBlockEditor } from "@/components/dashboard/content-block-editor";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listContentBlocks } from "@/services/cms.service";

export default async function ContentPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "content:write");
  const blocks = await listContentBlocks();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Content"
        description="Edit hero, about, and other CMS content blocks for the public site."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((block) =>
          canWrite ? (
            <ContentBlockEditor key={block.id} block={block} />
          ) : (
            <div
              key={block.id}
              className="rounded-lg border border-border p-4 text-sm text-muted-foreground"
            >
              <p className="font-medium text-foreground">{block.type}</p>
              <p className="mt-1">{block.title ?? "—"}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
