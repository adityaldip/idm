"use server";

import { revalidatePath } from "next/cache";
import { ContentBlockType, NewsStatus, type Prisma } from "@prisma/client";
import { getSessionActor } from "@/lib/server-session";
import { hasPermission } from "@/lib/permissions";
import {
  createNews,
  updateNews,
  deleteNews,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  updateContentBlock,
  createPartner,
  updatePartner,
  deletePartner,
  createServiceOffering,
  updateServiceOffering,
  deleteServiceOffering,
  markContactAsRead,
} from "@/services/cms.service";
import { createUser, updateUser } from "@/services/user.service";
import { updateSettings } from "@/services/settings.service";
import { createNewsSchema, updateNewsSchema } from "@/lib/validators/cms";
import { createTestimonialSchema, updateTestimonialSchema } from "@/lib/validators/cms";
import { updateContentBlockSchema } from "@/lib/validators/cms";
import { partnerSchema } from "@/lib/validators/partner";
import { offeringSchema } from "@/lib/validators/offering";
import { createUserSchema, updateUserSchema } from "@/lib/validators/user";

function parseFeatures(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
}

export async function saveNewsAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "news:write")) return { error: "Forbidden" };

  const publishedRaw = formData.get("publishedAt");
  const raw = {
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content"),
    coverImage: formData.get("coverImage") || undefined,
    status: formData.get("status"),
    publishedAt: publishedRaw
      ? new Date(String(publishedRaw)).toISOString()
      : undefined,
  };

  if (id) {
    const parsed = updateNewsSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid data" };
    await updateNews(id, parsed.data);
  } else {
    const parsed = createNewsSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid data" };
    await createNews(parsed.data, actor.id);
  }

  revalidatePath("/news");
  return { success: true };
}

export async function deleteNewsAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "news:write")) return { error: "Forbidden" };
  await deleteNews(id);
  revalidatePath("/news");
  return { success: true };
}

export async function saveTestimonialAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "testimonials:write")) return { error: "Forbidden" };

  const raw = {
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    role: formData.get("role") || undefined,
    content: formData.get("content"),
    rating: formData.get("rating") ? Number(formData.get("rating")) : 5,
    avatarUrl: formData.get("avatarUrl") || undefined,
    isActive: formData.get("isActive") === "on",
    sortOrder: formData.get("sortOrder") ? Number(formData.get("sortOrder")) : 0,
  };

  if (id) {
    const parsed = updateTestimonialSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid data" };
    await updateTestimonial(id, parsed.data);
  } else {
    const parsed = createTestimonialSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid data" };
    await createTestimonial(parsed.data);
  }

  revalidatePath("/testimonials");
  return { success: true };
}

export async function deleteTestimonialAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "testimonials:write")) return { error: "Forbidden" };
  await deleteTestimonial(id);
  revalidatePath("/testimonials");
  return { success: true };
}

export async function saveContentBlockAction(formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "content:write")) return { error: "Forbidden" };

  const type = formData.get("type") as ContentBlockType;
  const parsed = updateContentBlockSchema.safeParse({
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    body: formData.get("body") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });
  if (!parsed.success) return { error: "Invalid data" };

  const { metadata, ...rest } = parsed.data;
  await updateContentBlock(type, {
    ...rest,
    ...(metadata !== undefined && { metadata: metadata as Prisma.InputJsonValue }),
  });
  revalidatePath("/content");
  return { success: true };
}

export async function savePartnerAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "content:write")) return { error: "Forbidden" };

  const parsed = partnerSchema.safeParse({
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl"),
    website: formData.get("website") || undefined,
    isActive: formData.get("isActive") === "on",
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return { error: "Invalid data" };

  if (id) await updatePartner(id, parsed.data);
  else await createPartner(parsed.data);

  revalidatePath("/partners");
  return { success: true };
}

export async function deletePartnerAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "content:write")) return { error: "Forbidden" };
  await deletePartner(id);
  revalidatePath("/partners");
  return { success: true };
}

export async function saveOfferingAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "content:write")) return { error: "Forbidden" };

  const parsed = offeringSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon") || undefined,
    isActive: formData.get("isActive") === "on",
    sortOrder: formData.get("sortOrder"),
    features: formData.get("features"),
  });
  if (!parsed.success) return { error: "Invalid data" };

  const data = { ...parsed.data, features: parseFeatures(parsed.data.features) };

  if (id) await updateServiceOffering(id, data);
  else await createServiceOffering(data);

  revalidatePath("/offerings");
  return { success: true };
}

export async function deleteOfferingAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "content:write")) return { error: "Forbidden" };
  await deleteServiceOffering(id);
  revalidatePath("/offerings");
  return { success: true };
}

export async function markInboxReadAction(id: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "content:read")) return { error: "Forbidden" };
  await markContactAsRead(id);
  revalidatePath("/inbox");
  return { success: true };
}

export async function saveUserAction(formData: FormData, id?: string) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "users:write")) return { error: "Forbidden" };

  if (id) {
    const raw = {
      name: formData.get("name") || undefined,
      phone: formData.get("phone") || undefined,
      role: formData.get("role") || undefined,
      branchId: formData.get("branchId") || null,
      isActive: formData.get("isActive") === "on",
      password: formData.get("password") || undefined,
    };
    const parsed = updateUserSchema.safeParse({
      ...raw,
      branchId: raw.branchId === "" ? null : raw.branchId,
      password: raw.password === "" ? undefined : raw.password,
    });
    if (!parsed.success) return { error: "Invalid data" };
    await updateUser(id, parsed.data);
  } else {
    const parsed = createUserSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
      role: formData.get("role"),
      branchId: formData.get("branchId") || undefined,
    });
    if (!parsed.success) return { error: "Invalid data" };
    await createUser(parsed.data);
  }

  revalidatePath("/users");
  return { success: true };
}

export async function saveSettingsAction(formData: FormData) {
  const actor = await getSessionActor();
  if (!hasPermission(actor.role, "settings:write")) return { error: "Forbidden" };

  const updates: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("setting_")) {
      updates[key.replace("setting_", "")] = String(value);
    }
  }

  await updateSettings(updates, actor.id);
  revalidatePath("/settings");
  return { success: true };
}
