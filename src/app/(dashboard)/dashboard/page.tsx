import { auth } from "@/lib/auth";
import { SHIPMENT_STATUS_LABELS } from "@/lib/constants";
import { getDashboardKpis } from "@/services/analytics.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, Truck, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();
  const actor = {
    role: session!.user!.role,
    branchId: session?.user?.branchId,
  };
  const data = await getDashboardKpis(actor);

  const kpis = [
    {
      title: "Total Shipments",
      value: data.kpis.totalShipments.toLocaleString("id-ID"),
      icon: Package,
      change: `${data.kpis.activeShipments} active`,
    },
    {
      title: "Revenue",
      value: `Rp ${data.kpis.totalRevenue.toLocaleString("id-ID")}`,
      icon: TrendingUp,
      change: "All time",
    },
    {
      title: "Delivered Today",
      value: data.kpis.deliveredToday.toLocaleString("id-ID"),
      icon: Truck,
      change: "Completed today",
    },
    {
      title: "Active Customers",
      value: data.kpis.totalCustomers.toLocaleString("id-ID"),
      icon: Users,
      change: "Registered",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">
          Welcome back, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your logistics operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Shipments (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {data.shipmentsChart.map((day) => {
                const max = Math.max(
                  ...data.shipmentsChart.map((d) => d.count),
                  1,
                );
                const height = (day.count / max) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${day.count} shipments`}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {day.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shipments yet.</p>
            ) : (
              data.statusBreakdown.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {SHIPMENT_STATUS_LABELS[item.status] ?? item.status}
                  </span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            data.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user?.name ?? "System"}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
