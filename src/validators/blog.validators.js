import { z } from "zod";

export const upsertBlogSchema = z.object({
  title: z.string().min(3).max(160),
  slug: z.string().min(3).max(200),
  excerpt: z.string().max(400).optional(),
  content: z.string().min(20),
  coverImage: z.string().url().optional(),
  authorName: z.string().min(2).max(80),
  keywords: z.array(z.string().min(1).max(40)).optional(),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(300).optional(),
  ogImage: z.string().url().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional()
});
