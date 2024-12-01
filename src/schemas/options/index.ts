import { z } from 'zod'
import { SpotlightAttributeSchema } from '../core/spotlight.js'

/**
 * Schema for mdfind command options.
 * Validates and transforms options for the mdfind search command.
 *
 * Options:
 * - onlyIn: Limit search to specific directory
 * - name: Search by filename pattern
 * - live: Enable real-time updates
 * - count: Return only count of matches
 * - attr: Return specific metadata attributes
 * - smartFolder: Use saved search
 * - nullSeparator: Use null character as separator
 * - maxBuffer: Maximum buffer size for results
 * - reprint: Reprint results in live mode
 * - literal: Disable special query interpretation
 * - interpret: Enable natural language interpretation
 *
 * Default values:
 * - live: false
 * - count: false
 * - nullSeparator: false
 * - maxBuffer: 512KB
 * - reprint: false
 * - literal: false
 * - interpret: false
 *
 * @example
 * Basic search options:
 * ```typescript
 * const options = MdfindOptionsSchema.parse({
 *   onlyIn: '~/Documents',
 *   name: '*.pdf',
 *   maxBuffer: 1024 * 1024
 * })
 * ```
 *
 * @example
 * Live search options:
 * ```typescript
 * const options = MdfindOptionsSchema.parse({
 *   live: true,
 *   reprint: true,
 *   interpret: true
 * })
 * ```
 */
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

/**
 * Schema for mdls command options.
 * Validates and transforms options for the mdls metadata listing command.
 *
 * Options:
 * - attributes: List of metadata attributes to return
 * - raw: Return raw attribute values
 * - nullMarker: String to use for null values
 *
 * Default values:
 * - attributes: [] (all attributes)
 * - raw: false
 * - nullMarker: '(null)'
 *
 * @example
 * Basic metadata options:
 * ```typescript
 * const options = MdlsOptionsSchema.parse({
 *   attributes: ['kMDItemDisplayName', 'kMDItemContentType'],
 *   raw: true
 * })
 * ```
 *
 * @example
 * Custom null handling:
 * ```typescript
 * const options = MdlsOptionsSchema.parse({
 *   nullMarker: 'N/A',
 *   raw: false
 * })
 * ```
 */
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

/**
 * Schema for mdutil command options.
 * Validates and transforms options for the mdutil indexing utility command.
 *
 * Options:
 * - verbose: Enable detailed output
 *
 * Default values:
 * - verbose: false
 *
 * @example
 * Basic indexing options:
 * ```typescript
 * const options = MdutilOptionsSchema.parse({
 *   verbose: true
 * })
 * ```
 */
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
