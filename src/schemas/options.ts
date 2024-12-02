import { z } from 'zod'

/**
 * Core options shared across all Spotlight-related operations
 */
const CoreOptionsSchema = z.object({
  maxBuffer: z.number().default(1024 * 512),
  literal: z.boolean().default(false),
  interpret: z.boolean().default(false)
})

/**
 * Options specific to search operations
 */
export const SearchOptionsSchema = CoreOptionsSchema.extend({
  live: z.boolean().default(false),
  /**
   * Automatically stop live search after specified duration (in milliseconds).
   * Only applies to live searches.
   * When timeout is reached:
   * - Search will be stopped
   * - onComplete callback will be called
   * - Resources will be cleaned up
   * @example
   * ```typescript
   * // Stop after 5 seconds
   * const options = { live: true, timeout: 5000 }
   * ```
   */
  timeout: z.number().optional(),
  operator: z.enum(['&&', '||']).default('&&'),
  count: z.boolean().default(false),
  reprint: z.boolean().default(false),
  nullSeparator: z.boolean().default(false)
})

/**
 * Options for file path and attribute filtering
 */
export const FilterOptionsSchema = CoreOptionsSchema.extend({
  name: z.string().optional(),
  names: z.array(z.string()).optional().default([]),
  onlyIn: z.string().optional(),
  onlyInDirectory: z.string().optional(),
  attr: z.string().optional(),
  attributes: z.array(z.string()).optional().default([]),
  smartFolder: z.string().optional()
})

/**
 * Complete mdfind options combining search and filter options
 */
export const MdfindOptionsSchema = SearchOptionsSchema.merge(FilterOptionsSchema)

/**
 * Input schema that accepts partial options
 */
export const MdfindOptionsInputSchema = MdfindOptionsSchema.partial()

/**
 * Transformed output schema that normalizes legacy and new options
 */
export const MdfindOptionsOutputSchema = MdfindOptionsSchema.transform(opts => {
  const transformed = {
    ...opts,
    names: [] as string[],
    attributes: [] as string[]
  }

  // Normalize path options
  transformed.onlyInDirectory = opts.onlyIn ?? opts.onlyInDirectory

  // Normalize name options
  transformed.name = opts.name
  transformed.names = opts.names ?? []

  // Normalize attribute options
  transformed.attr = opts.attr
  transformed.attributes = opts.attributes ?? []

  return transformed
})

/**
 * Options for mdls (metadata listing) operations
 */
export const MdlsOptionsSchema = CoreOptionsSchema.extend({
  attributes: z.array(z.string()).default([]),
  raw: z.boolean().default(false),
  nullMarker: z.string().default('(null)'),
  structured: z.boolean().default(false)
})

/**
 * Options for mdutil (indexing utility) operations
 */
export const MdutilOptionsSchema = CoreOptionsSchema.extend({
  volume: z.string().optional(),
  verbose: z.boolean().default(false),
  excludeSystemVolumes: z.boolean().default(false),
  excludeUnknownState: z.boolean().default(false)
})

/**
 * Options for mdimport (metadata import) operations
 */
export const MdimportOptionsSchema = CoreOptionsSchema.extend({
  recursive: z.boolean().default(false),
  remove: z.boolean().default(false),
  update: z.boolean().default(false),
  scanNow: z.boolean().default(false),
  importerInfo: z.boolean().default(false),
  attributeInfo: z.boolean().default(false)
})

// Type exports
export type CoreOptions = z.infer<typeof CoreOptionsSchema>
export type SearchOptions = z.infer<typeof SearchOptionsSchema>
export type FilterOptions = z.infer<typeof FilterOptionsSchema>
export type MdfindOptionsInput = z.input<typeof MdfindOptionsInputSchema>
export type MdfindOptions = z.output<typeof MdfindOptionsOutputSchema>
export type MdlsOptions = z.infer<typeof MdlsOptionsSchema>
export type MdutilOptions = z.infer<typeof MdutilOptionsSchema>
export type MdimportOptions = z.infer<typeof MdimportOptionsSchema>
