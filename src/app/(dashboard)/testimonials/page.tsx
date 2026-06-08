import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  TestimonialFormSheet,
  DeleteTestimonialButton,
} from "@/components/dashboard/cms-form-sheets";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listTestimonials } from "@/services/cms.service";

export default async function TestimonialsPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "testimonials:write");

  const { items } = await listTestimonials({
    page: 1,
    limit: 50,
    sortOrder: "asc",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Manage customer testimonials shown on the public website."
        actions={canWrite ? <TestimonialFormSheet /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          description="Add customer quotes to build trust on your homepage."
          action={canWrite ? <TestimonialFormSheet /> : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Rating</th>
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
                        {item.company ?? "—"}
                      </td>
                      <td className="px-4 py-3">{item.rating}/5</td>
                      <td className="px-4 py-3">
                        {item.isActive ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-3">{item.sortOrder}</td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <TestimonialFormSheet item={item} />
                            <DeleteTestimonialButton id={item.id} />
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
