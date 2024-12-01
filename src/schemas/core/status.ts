import { z } from 'zod'

// Indexing status schema
export const IndexStatusSchema = z
  .object({
    enabled: z.boolean(),
    status: z.string(),
    scanBaseTime: z.date().optional(),
    reasoning: z.string().optional()
  })
  .strict()

export type IndexStatus = z.infer<typeof IndexStatusSchema>
