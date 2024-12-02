import { z } from 'zod'

/**
 * Schema for mdls command options.
 * Validates and provides defaults for all mdls configuration options.
 */
export const MdlsOptionsSchema = z
  .object({
    maxBuffer: z.number().positive().optional(),
    literal: z.boolean().optional(),
    interpret: z.boolean().optional(),
    attributes: z.array(z.string().trim().min(1)).optional(),
    raw: z.boolean().optional(),
    nullMarker: z.string().min(1).optional(),
    structured: z.boolean().optional()
  })
  .transform(opts => ({
    maxBuffer: opts.maxBuffer ?? 1024 * 1024, // 1MB default
    literal: opts.literal ?? false,
    interpret: opts.interpret ?? true,
    attributes: opts.attributes ?? [],
    raw: opts.raw ?? false,
    nullMarker: opts.nullMarker ?? '(null)',
    structured: opts.structured ?? false
  }))
  .refine(data => !(data.literal && data.interpret), {
    message: 'Cannot use both literal and interpret options'
  })

export type MdlsOptions = z.input<typeof MdlsOptionsSchema>
export type ValidatedMdlsOptions = z.infer<typeof MdlsOptionsSchema>
