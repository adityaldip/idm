import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { getRecentActivities } from "./activity.service";

function branchFilter(branchId?: string | null, role?: Role) {
  if (role === "OPERATOR" && branchId) {
    return {
      OR: [{ originBranchId: branchId }, { destinationBranchId: branchId }],
    };
  }
  return {};
}

export async function getDashboardKpis(actor: {
  role: Role;
  branchId?: string | null;
}) {
  const scope = branchFilter(actor.branchId, actor.role);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalShipments,
    activeShipments,
    deliveredToday,
    totalCustomers,
    revenueAgg,
    statusBreakdown,
    recentActivities,
    statusDefs,
    shipmentsLast7Days,
  ] = await Promise.all([
    prisma.shipment.count({ where: scope }),
    prisma.shipment.count({
      where: {
        ...scope,
        status: { isFinal: false },
      },
    }),
    prisma.shipment.count({
      where: {
        ...scope,
        status: { isFinal: true, allowFromAny: false },
        actualDelivery: { gte: today },
      },
    }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.shipment.aggregate({
      where: scope,
      _sum: { totalCost: true },
    }),
    prisma.shipment.groupBy({
      by: ["statusId"],
      where: scope,
      _count: { id: true },
    }),
    getRecentActivities(8),
    prisma.shipmentStatusDef.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.shipment.findMany({
      where: {
        ...scope,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { createdAt: true },
    }),
  ]);

  const chartByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    const count = shipmentsLast7Days.filter(
      (s) => s.createdAt >= date && s.createdAt < next,
    ).length;
    return {
      date: date.toISOString().slice(0, 10),
      count,
    };
  });

  return {
    kpis: {
      totalShipments,
      activeShipments,
      deliveredToday,
      totalCustomers,
      totalRevenue: Number(revenueAgg._sum.totalCost ?? 0),
    },
    statusBreakdown: statusBreakdown.map((s) => {
      const def = statusDefs.find((d) => d.id === s.statusId);
      return {
        code: def?.code ?? s.statusId,
        label: def?.label ?? s.statusId,
        color: def?.color ?? "slate",
        count: s._count?.id ?? 0,
      };
    }),
    shipmentsChart: chartByDay,
    recentActivities,
  };
}
