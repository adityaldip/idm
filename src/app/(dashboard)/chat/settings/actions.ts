"use server";

import { revalidatePath } from "next/cache";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import { chatSettingsSchema } from "@/lib/validators/chat";
import { saveChatSettings } from "@/services/chat.service";

export async function saveChatSettingsAction(payload: unknown) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "chat:settings")) {
    return { error: "Forbidden" };
  }

  const parsed = chatSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Pengaturan tidak valid." };
  }

  await saveChatSettings(parsed.data, actor.id);
  revalidatePath("/chat/settings");
  revalidatePath("/", "layout");
  return { success: true };
}
