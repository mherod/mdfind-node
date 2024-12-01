import { z } from 'zod'

// Core options shared between input and output
const CoreOptionsSchema = z.object({
  live: z.boolean().default(false),
  count: z.boolean().default(false),
  nullSeparator: z.boolean().default(false),
  maxBuffer: z.number().default(1024 * 512),
  reprint: z.boolean().default(false),
  literal: z.boolean().default(false),
  interpret: z.boolean().default(false)
})

// Input type schema (what users provide)
export const MdfindOptionsInputSchema = CoreOptionsSchema.extend({
  // Legacy single-value options (for backward compatibility)
  name: z.string().optional(),
  onlyIn: z.string().optional(),
  attr: z.string().optional(),

  // New array-based options
  names: z.array(z.string()).optional().default([]),
  attributes: z.array(z.string()).optional().default([]),
  onlyInDirectory: z.string().optional(),

  // Other options
  smartFolder: z.string().optional()
})

// Output type schema (after transformation)
export const MdfindOptionsOutputSchema = CoreOptionsSchema.extend({
  // Legacy single-value options (preserved for backward compatibility)
  name: z.string().optional(),
  onlyIn: z.string().optional(),
  attr: z.string().optional(),

  // Array-based options
  names: z.array(z.string()),
  attributes: z.array(z.string()),
  onlyInDirectory: z.string().optional(),

  // Other options
  smartFolder: z.string().optional()
})

// Schema that handles the transformation
export const MdfindOptionsSchema = MdfindOptionsInputSchema.transform(opts => {
  const transformed = {
    ...opts,
    names: [] as string[],
    attributes: [] as string[]
  }

  // Convert legacy options to array format while preserving originals
  const namesList = opts.names ?? []
  const attributesList = opts.attributes ?? []

  transformed.names = [...new Set([...namesList, ...(opts.name ? [opts.name] : [])])]
  transformed.attributes = [...new Set([...attributesList, ...(opts.attr ? [opts.attr] : [])])]
  transformed.onlyInDirectory = opts.onlyIn ?? transformed.onlyInDirectory

  return MdfindOptionsOutputSchema.parse(transformed)
})

// Export both input and output types
export type MdfindOptionsInput = z.input<typeof MdfindOptionsInputSchema>
export type MdfindOptions = z.output<typeof MdfindOptionsSchema>

export const MdlsOptionsSchema = z.object({
  attributes: z.array(z.string()).default([]),
  raw: z.boolean().default(false),
  nullMarker: z.string().default('(null)'),
  structured: z.boolean().default(false)
})

export type MdlsOptions = z.infer<typeof MdlsOptionsSchema>

export const MdutilOptionsSchema = z.object({
  volume: z.string().optional(),
  verbose: z.boolean().default(false),
  excludeSystemVolumes: z.boolean().default(false),
  excludeUnknownState: z.boolean().default(false)
})

export type MdutilOptions = z.infer<typeof MdutilOptionsSchema>

export const MdimportOptionsSchema = z.object({
  recursive: z.boolean().default(false),
  remove: z.boolean().default(false),
  update: z.boolean().default(false),
  scanNow: z.boolean().default(false),
  importerInfo: z.boolean().default(false),
  attributeInfo: z.boolean().default(false)
})

export type MdimportOptions = z.infer<typeof MdimportOptionsSchema>
