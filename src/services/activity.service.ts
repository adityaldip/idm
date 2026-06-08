import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LogActivityInput = {
  type: ActivityType;
  message: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
};

export async function logActivity(input: LogActivityInput) {
  return prisma.activityLog.create({
    data: {
      type: input.type,
      message: input.message,
      userId: input.userId,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
    },
  });
}

export async function getRecentActivities(limit = 10) {
  return prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}
