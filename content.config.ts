import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    projects: defineCollection({
      type: 'page',
      source: 'projects/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        stack: z.array(z.string()),
        status: z.string(),
        url: z.string().optional(),
        repo: z.string().optional(),
        date: z.string(),
      }),
    }),
    interests: defineCollection({
      type: 'page',
      source: 'interests/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
      }),
    }),
  },
})
