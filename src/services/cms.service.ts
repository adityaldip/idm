import type { ContentBlockType, NewsStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginationMeta } from "@/lib/validators/common";
import type { PaginationInput } from "@/lib/validators/common";

export async function listNews(filters: PaginationInput & { status?: NewsStatus }) {
  const { page, limit, search, sortOrder, status } = filters;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: sortOrder },
      include: { author: { select: { id: true, name: true } } },
    }),
    prisma.news.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function createNews(
  input: {
    slug: string;
    title: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    status?: NewsStatus;
    publishedAt?: string;
  },
  authorId: string,
) {
  return prisma.news.create({
    data: {
      ...input,
      authorId,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
    },
  });
}

export async function updateNews(
  id: string,
  input: Partial<{
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    status: NewsStatus;
    publishedAt: string;
  }>,
) {
  return prisma.news.update({
    where: { id },
    data: {
      ...input,
      publishedAt: input.publishedAt
        ? new Date(input.publishedAt)
        : undefined,
    },
  });
}

export async function deleteNews(id: string) {
  await prisma.news.delete({ where: { id } });
  return true;
}

export async function listTestimonials(filters: PaginationInput) {
  const { page, limit, search, sortOrder } = filters;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { company: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { sortOrder: sortOrder },
    }),
    prisma.testimonial.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function createTestimonial(input: {
  name: string;
  company?: string;
  role?: string;
  content: string;
  rating?: number;
  avatarUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  return prisma.testimonial.create({ data: input });
}

export async function updateTestimonial(
  id: string,
  input: Partial<{
    name: string;
    company: string;
    role: string;
    content: string;
    rating: number;
    avatarUrl: string;
    isActive: boolean;
    sortOrder: number;
  }>,
) {
  return prisma.testimonial.update({ where: { id }, data: input });
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } });
  return true;
}

export async function listContentBlocks() {
  return prisma.contentBlock.findMany({ orderBy: { type: "asc" } });
}

export async function updateContentBlock(
  type: ContentBlockType,
  input: {
    title?: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  const data = {
    title: input.title,
    subtitle: input.subtitle,
    body: input.body,
    imageUrl: input.imageUrl,
    metadata: input.metadata,
  };
  return prisma.contentBlock.upsert({
    where: { type },
    update: data,
    create: { type, ...data },
  });
}

export async function getNewsById(id: string) {
  return prisma.news.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function listPartners() {
  return prisma.partner.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createPartner(input: {
  name: string;
  logoUrl: string;
  website?: string;
  isActive?: boolean;
  sortOrder?: number;
}) {
  return prisma.partner.create({ data: input });
}

export async function updatePartner(
  id: string,
  input: Partial<{
    name: string;
    logoUrl: string;
    website: string;
    isActive: boolean;
    sortOrder: number;
  }>,
) {
  return prisma.partner.update({ where: { id }, data: input });
}

export async function deletePartner(id: string) {
  await prisma.partner.delete({ where: { id } });
  return true;
}

export async function listServiceOfferings() {
  return prisma.serviceOffering.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { shipments: true } } },
  });
}

export async function listActiveServiceOfferings() {
  return prisma.serviceOffering.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, slug: true, name: true },
  });
}

export async function assertActiveServiceOffering(id: string) {
  const offering = await prisma.serviceOffering.findFirst({
    where: { id, isActive: true },
  });
  if (!offering) {
    throw new Error("Invalid or inactive service offering");
  }
  return offering;
}

export async function createServiceOffering(input: {
  slug: string;
  name: string;
  description: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
  features: string[];
}) {
  return prisma.serviceOffering.create({ data: input });
}

export async function updateServiceOffering(
  id: string,
  input: Partial<{
    slug: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    sortOrder: number;
    features: string[];
  }>,
) {
  return prisma.serviceOffering.update({ where: { id }, data: input });
}

export async function deleteServiceOffering(id: string) {
  const shipmentCount = await prisma.shipment.count({
    where: { serviceOfferingId: id },
  });
  if (shipmentCount > 0) {
    throw new Error("Cannot delete service linked to shipments");
  }
  await prisma.serviceOffering.delete({ where: { id } });
  return true;
}

export async function listContactSubmissions(filters: {
  page: number;
  limit: number;
  unreadOnly?: boolean;
}) {
  const { page, limit, unreadOnly } = filters;
  const skip = (page - 1) * limit;
  const where = unreadOnly ? { isRead: false } : {};

  const [items, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactSubmission.count({ where }),
  ]);

  return { items, meta: paginationMeta(page, limit, total) };
}

export async function markContactAsRead(id: string) {
  return prisma.contactSubmission.update({
    where: { id },
    data: { isRead: true },
  });
}

export async function submitContact(input: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return prisma.contactSubmission.create({ data: input });
}
