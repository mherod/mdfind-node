import { z } from 'zod'

// Error schema
export const MdfindErrorSchema = z
  .object({
    name: z.literal('MdfindError'),
    message: z.string(),
    stderr: z.string()
  })
  .strict()

// Live search event handlers
export const LiveSearchEventsSchema = z
  .object({
    onResult: z.function().args(z.array(z.string())).returns(z.void()),
    onError: z.function().args(MdfindErrorSchema).returns(z.void()),
    onEnd: z.function().returns(z.void()).optional()
  })
  .strict()

export type LiveSearchEvents = z.infer<typeof LiveSearchEventsSchema>
