import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    about: defineCollection({
      type: 'data',
      source: 'about/*.json',
      schema: z.object({
        name: z.string(),
        role: z.string(),
        summary: z.string(),
        location: z.string(),
        links: z.array(z.object({
          label: z.string(),
          url: z.string(),
        })),
      }),
    }),
    projects: defineCollection({
      type: 'data',
      source: 'projects/*.json',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        paragraphs: z.array(z.string()),
        tech: z.array(z.string()),
        status: z.string(),
        links: z.object({
          website: z.string().optional(),
          github: z.string().optional(),
          video: z.string().optional(),
        }),
        date: z.string(),
        order: z.number().optional(),
      }),
    }),
    content: defineCollection({
      type: 'data',
      source: 'content/*.json',
      schema: z.object({
        title: z.string(),
        url: z.string(),
        source: z.enum(['YouTube', 'TikTok', 'Twitter', 'Instagram', 'LinkedIn', 'Twitch']),
        thumbnail: z.string().optional(),
        date: z.string(),
        order: z.number().optional(),
      }),
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        icon: z.string().optional(),
      }),
    }),
  },
})
