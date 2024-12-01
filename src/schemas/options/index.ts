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
  .transform(opts => ({
    live: false,
    count: false,
    nullSeparator: false,
    maxBuffer: 1024 * 512,
    reprint: false,
    literal: false,
    interpret: false,
    ...opts
  }))

export const MdlsOptionsSchema = z
  .object({
    attributes: z.array(SpotlightAttributeSchema).optional(),
    raw: z.boolean().optional(),
    nullMarker: z.string().optional()
  })
  .strict()
  .transform(opts => ({
    attributes: [],
    raw: false,
    nullMarker: '(null)',
    ...opts
  }))

export const MdutilOptionsSchema = z
  .object({
    verbose: z.boolean().optional()
  })
  .strict()
  .transform(opts => ({
    verbose: false,
    ...opts
  }))

export type MdfindOptions = z.input<typeof MdfindOptionsSchema>
export type MdlsOptions = z.input<typeof MdlsOptionsSchema>
export type MdutilOptions = z.input<typeof MdutilOptionsSchema>
