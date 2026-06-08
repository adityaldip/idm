import { z } from "zod";
import { ContentBlockType, NewsStatus } from "@prisma/client";
import { paginationSchema } from "./common";

export const newsListSchema = paginationSchema.extend({
  status: z.nativeEnum(NewsStatus).optional(),
});

export const createNewsSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  status: z.nativeEnum(NewsStatus).default(NewsStatus.DRAFT),
  publishedAt: z.string().optional(),
});

export const updateNewsSchema = createNewsSchema.partial();

export const createTestimonialSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const updateContentBlockSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const contentBlockTypeSchema = z.nativeEnum(ContentBlockType);
