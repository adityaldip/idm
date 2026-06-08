import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  OfferingFormSheet,
  DeleteOfferingButton,
} from "@/components/dashboard/cms-form-sheets";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listServiceOfferings } from "@/services/cms.service";

export default async function OfferingsPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "content:write");

  const items = await listServiceOfferings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service Offerings"
        description="Manage services for the public website and shipment creation."
        actions={canWrite ? <OfferingFormSheet /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No services configured"
          description="Add services here — they appear on the website and in the New Shipment form."
          action={canWrite ? <OfferingFormSheet /> : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Shipments</th>
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
                        <div className="font-medium">{item.name}</div>
                        <div className="max-w-xs truncate text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {item.slug}
                      </td>
                      <td className="px-4 py-3">{item.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{item.sortOrder}</td>
                      <td className="px-4 py-3">{item._count.shipments}</td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <OfferingFormSheet item={item} />
                            <DeleteOfferingButton id={item.id} />
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
    </div>
  );
}
