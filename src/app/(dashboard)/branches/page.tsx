import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  BranchFormSheet,
  DeleteBranchButton,
} from "@/components/dashboard/branch-form-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { listBranches } from "@/services/branch.service";

export default async function BranchesPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "branches:write");

  const { items } = await listBranches({
    page: 1,
    limit: 50,
    sortOrder: "asc",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Management"
        description="View and manage office locations across Indonesia."
        actions={canWrite ? <BranchFormSheet /> : undefined}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No branches found"
          description="Add your first branch office to assign staff and vehicles."
          action={canWrite ? <BranchFormSheet /> : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((branch) => (
            <Card key={branch.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-heading font-semibold">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.code}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {branch.isHeadquarters && (
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-medium text-secondary">
                        HQ
                      </span>
                    )}
                    {canWrite && (
                      <>
                        <BranchFormSheet item={branch} />
                        <DeleteBranchButton id={branch.id} name={branch.name} />
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {branch.address}
                </p>
                <p className="text-sm">
                  {branch.city}, {branch.province}
                  {branch.postalCode ? ` ${branch.postalCode}` : ""}
                </p>
                <p className="mt-2 text-sm">{branch.phone}</p>
                {branch.email && (
                  <p className="text-sm text-muted-foreground">{branch.email}</p>
                )}
                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                  <span>{branch._count.users} staff</span>
                  <span>{branch._count.vehicles} vehicles</span>
                  <span
                    className={
                      branch.isActive ? "text-emerald-600" : "text-red-500"
                    }
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
