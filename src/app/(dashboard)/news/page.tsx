import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  NewsFormSheet,
  DeleteNewsButton,
} from "@/components/dashboard/cms-form-sheets";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { NEWS_STATUS_LABELS } from "@/lib/constants";
import { listNews } from "@/services/cms.service";

interface NewsPageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "news:write");

  const { items, meta } = await listNews({
    page: Number(params.page ?? 1),
    limit: 20,
    search: params.search,
    sortOrder: "desc",
    status: params.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Management"
        description="Publish and manage company news articles."
        actions={canWrite ? <NewsFormSheet /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Create your first news article for the public website."
          action={canWrite ? <NewsFormSheet /> : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Published</th>
                    {canWrite && <th className="px-4 py-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                          {NEWS_STATUS_LABELS[item.status] ?? item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.author?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.publishedAt
                          ? format(item.publishedAt, "dd MMM yyyy")
                          : "—"}
                      </td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <NewsFormSheet item={item} />
                            <DeleteNewsButton id={item.id} />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {meta.totalPages > 1 && (
        <p className="text-sm text-muted-foreground">
          Page {meta.page} of {meta.totalPages} ({meta.total} articles)
        </p>
      )}
    </div>
  );
}
