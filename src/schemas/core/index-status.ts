import { z } from 'zod'

export const IndexStatusSchema = z.object({
  enabled: z.boolean(),
  scanBaseTime: z
    .string()
    .transform(str => new Date(str))
    .nullable()
    .optional(),
  reasoning: z.string().nullable()
})

export type IndexStatus = z.infer<typeof IndexStatusSchema>
