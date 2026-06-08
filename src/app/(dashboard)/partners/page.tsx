import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PartnerFormSheet,
  DeletePartnerButton,
} from "@/components/dashboard/cms-form-sheets";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listPartners } from "@/services/cms.service";

export default async function PartnersPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "content:write");

  const items = await listPartners();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        description="Manage partner logos shown in the Klien Kami section."
        actions={canWrite ? <PartnerFormSheet /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No partners yet"
          description="Add client and partner logos for the homepage."
          action={canWrite ? <PartnerFormSheet /> : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Website</th>
                    <th className="px-4 py-3 font-medium">Active</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    {canWrite && <th className="px-4 py-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.website ? (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {item.website}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">{item.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{item.sortOrder}</td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <PartnerFormSheet item={item} />
                            <DeletePartnerButton id={item.id} />
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
