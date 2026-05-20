import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
      title: z.string().min(10).max(70),
      description: z.string().min(50).max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default('Moeed Rajpoot'),
      tags: z.array(z.string()).default([]),
      heroImage: z.string().optional(),
      heroAlt: z.string().optional(),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      noindex: z.boolean().default(false),
      canonicalUrl: z.string().url().optional(),
      keywords: z.array(z.string()).default([]),
    }),
});

export const collections = { posts };
