import { z } from 'zod'
import { SpotlightAttributeSchema } from '../core/spotlight.js'

// Command options schemas
export const MdfindOptionsSchema = z
  .object({
    onlyIn: z.string().optional(),
    name: z.string().optional(),
    live: z.boolean().optional(),
    count: z.boolean().optional(),
    attr: SpotlightAttributeSchema.optional(),
    smartFolder: z.string().optional(),
    nullSeparator: z.boolean().optional(),
    maxBuffer: z.number().optional(),
    reprint: z.boolean().optional(),
    literal: z.boolean().optional(),
    interpret: z.boolean().optional()
  })
  .strict()

export const MdlsOptionsSchema = z
  .object({
    attributes: z.array(SpotlightAttributeSchema).optional(),
    raw: z.boolean().optional(),
    nullMarker: z.string().optional()
  })
  .strict()

export const MdutilOptionsSchema = z
  .object({
    verbose: z.boolean().optional()
  })
  .strict()

export type MdfindOptions = z.infer<typeof MdfindOptionsSchema>
export type MdlsOptions = z.infer<typeof MdlsOptionsSchema>
export type MdutilOptions = z.infer<typeof MdutilOptionsSchema>
