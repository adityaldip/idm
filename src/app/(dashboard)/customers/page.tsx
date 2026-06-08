import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  CustomerFormDialog,
  DeleteCustomerButton,
} from "@/components/dashboard/customer-form-dialog";
import { CustomersFilters } from "@/components/dashboard/customers-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSessionActor } from "@/lib/server-session";
import { listCustomers } from "@/services/customer.service";
import { hasPermission } from "@/lib/permissions";
import { format } from "date-fns";

interface CustomersPageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const actor = await getSessionActor();
  const canWrite = hasPermission(actor.role, "customers:write");

  const { items, meta } = await listCustomers({
    page: Number(params.page ?? 1),
    limit: 20,
    search: params.search,
    sortOrder: "desc",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Management"
        description="Manage customer accounts and shipment history."
        actions={canWrite ? <CustomerFormDialog /> : undefined}
      />

      <Suspense>
        <CustomersFilters />
      </Suspense>

      {items.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Add your first customer to start creating shipments."
          action={canWrite ? <CustomerFormDialog /> : undefined}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Shipments</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Joined</th>
                    {canWrite && (
                      <th className="px-4 py-3 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">{customer.code}</td>
                      <td className="px-4 py-3">{customer.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {customer.company ?? "—"}
                      </td>
                      <td className="px-4 py-3">{customer._count.shipments}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            customer.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {format(customer.createdAt, "dd MMM yyyy")}
                      </td>
                      {canWrite && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <CustomerFormDialog item={customer} />
                            <DeleteCustomerButton
                              id={customer.id}
                              code={customer.code}
                            />
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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} customers)
          </span>
          <div className="flex gap-2">
            {meta.page > 1 && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/customers?${new URLSearchParams({
                      ...(params.search && { search: params.search }),
                      page: String(meta.page - 1),
                    }).toString()}`}
                  />
                }
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
            )}
            {meta.page < meta.totalPages && (
              <Button
                nativeButton={false}
                render={
                  <Link
                    href={`/customers?${new URLSearchParams({
                      ...(params.search && { search: params.search }),
                      page: String(meta.page + 1),
                    }).toString()}`}
                  />
                }
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
