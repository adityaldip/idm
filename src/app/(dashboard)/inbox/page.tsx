import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MarkReadButton } from "@/components/dashboard/inbox-actions";
import { Card, CardContent } from "@/components/ui/card";
import { listContactSubmissions } from "@/services/cms.service";

interface InboxPageProps {
  searchParams: Promise<{ page?: string; unread?: string }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const params = await searchParams;

  const { items, meta } = await listContactSubmissions({
    page: Number(params.page ?? 1),
    limit: 20,
    unreadOnly: params.unread === "1",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Inbox"
        description="Messages submitted from the public contact form."
      />

      {items.length === 0 ? (
        <EmptyState
          title="Inbox is empty"
          description="New contact form submissions will appear here."
        />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className={item.isRead ? "opacity-80" : "border-primary/30"}
            >
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {item.name}
                      {!item.isRead && (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          New
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </p>
                    {item.subject && (
                      <p className="mt-1 text-sm font-medium">{item.subject}</p>
                    )}
                    <p className="mt-2 text-sm whitespace-pre-wrap">{item.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(item.createdAt, "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  {!item.isRead && <MarkReadButton id={item.id} />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <p className="text-sm text-muted-foreground">
          Page {meta.page} of {meta.totalPages} ({meta.total} messages)
        </p>
      )}
    </div>
  );
}
