import { prisma } from "@/lib/prisma";
import { logActivity } from "./activity.service";

export async function listSettings() {
  return prisma.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
}

export async function updateSettings(
  updates: Record<string, string>,
  userId: string,
) {
  const entries = Object.entries(updates);
  await Promise.all(
    entries.map(([key, value]) =>
      prisma.setting.update({ where: { key }, data: { value } }),
    ),
  );

  await logActivity({
    type: "SETTINGS_CHANGED",
    message: `Settings updated: ${entries.map(([k]) => k).join(", ")}`,
    userId,
  });

  return listSettings();
}
