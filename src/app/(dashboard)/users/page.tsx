import { format } from "date-fns";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UserFormSheet } from "@/components/dashboard/user-settings-forms";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { ROLE_LABELS } from "@/lib/constants";
import { listUsers } from "@/services/user.service";
import { listBranches } from "@/services/branch.service";

export default async function UsersPage() {
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "users:write");

  const [{ items }, { items: branches }] = await Promise.all([
    listUsers({ page: 1, limit: 50, sortOrder: "desc" }),
    listBranches({ page: 1, limit: 100, sortOrder: "asc" }),
  ]);

  const branchOptions = branches.map((b) => ({ id: b.id, name: b.name }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage staff accounts and role assignments."
        actions={
          canWrite ? <UserFormSheet branches={branchOptions} /> : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Create staff accounts for your team."
          action={
            canWrite ? <UserFormSheet branches={branchOptions} /> : undefined
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Branch</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Login</th>
                    {canWrite && <th className="px-4 py-3 font-medium">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.branch?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            user.isActive
                              ? "bg-green-500/10 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.lastLoginAt
                          ? format(user.lastLoginAt, "dd MMM yyyy")
                          : "—"}
                      </td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <UserFormSheet item={user} branches={branchOptions} />
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
