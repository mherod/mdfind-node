import { z } from 'zod'
import { SpotlightAttributeSchema } from '../core/index.js'

/**
 * Schema for mdls command options.
 * Validates and provides defaults for mdls configuration.
 *
 * Options:
 * - attributes: List of specific attributes to retrieve
 * - raw: Return raw attribute values without parsing
 * - nullMarker: String to use for null values in raw mode
 * - structured: Return metadata in structured format (basic, EXIF, XMP)
 *
 * @example
 * Basic options:
 * ```typescript
 * const options = MdlsOptionsSchema.parse({
 *   attributes: ['kMDItemPixelHeight', 'kMDItemPixelWidth']
 * })
 * ```
 *
 * @example
 * Raw output:
 * ```typescript
 * const options = MdlsOptionsSchema.parse({
 *   raw: true,
 *   nullMarker: 'N/A'
 * })
 * ```
 *
 * @example
 * Structured metadata:
 * ```typescript
 * const options = MdlsOptionsSchema.parse({
 *   structured: true
 * })
 * ```
 */
export const MdlsOptionsSchema = z
  .object({
    /**
     * List of specific attributes to retrieve.
     * If empty, all attributes are returned.
     */
    attributes: z.array(SpotlightAttributeSchema).default([]),

    /**
     * Return raw attribute values without parsing.
     * Useful for scripting or when exact values are needed.
     */
    raw: z.boolean().default(false),

    /**
     * String to use for null values in raw mode.
     * Only used when raw is true.
     */
    nullMarker: z.string().optional(),

    /**
     * Return metadata in structured format.
     * Groups metadata into basic, EXIF, and XMP categories.
     */
    structured: z.boolean().default(false)
  })
  .strict()
  .refine(
    data => {
      // nullMarker only makes sense with raw mode
      if (data.nullMarker && !data.raw) {
        return false
      }
      return true
    },
    {
      message: 'nullMarker can only be used with raw mode'
    }
  )

export type MdlsOptions = z.input<typeof MdlsOptionsSchema>
