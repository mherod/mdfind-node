import { z } from 'zod'

/**
 * Schema for Spotlight indexing status.
 * Validates the current state of the Spotlight indexing service.
 *
 * Properties:
 * - enabled: Whether Spotlight indexing is enabled
 * - status: Current indexing status message
 *   - "Indexing enabled" - Service is running normally
 *   - "Indexing disabled" - Service is turned off
 *   - "Indexing..." - Currently building index
 *   - "Index rebuild required" - Index needs to be rebuilt
 * - scanBaseTime: Optional timestamp of last completed scan
 * - reasoning: Optional explanation for current status
 *
 * Common status messages:
 * - "Indexing enabled" - Normal operation
 * - "Indexing disabled" - Service turned off
 * - "Indexing..." - Building index
 * - "Index rebuild required" - Index corruption
 * - "Indexing paused" - Temporary pause
 * - "Indexing pending" - Waiting to start
 *
 * @example
 * Normal status:
 * ```typescript
 * const status = IndexStatusSchema.parse({
 *   enabled: true,
 *   status: "Indexing enabled",
 *   scanBaseTime: new Date(),
 *   reasoning: "Index is up to date"
 * })
 * ```
 *
 * @example
 * Disabled status:
 * ```typescript
 * const status = IndexStatusSchema.parse({
 *   enabled: false,
 *   status: "Indexing disabled",
 *   reasoning: "User disabled indexing"
 * })
 * ```
 *
 * @example
 * Rebuilding status:
 * ```typescript
 * const status = IndexStatusSchema.parse({
 *   enabled: true,
 *   status: "Indexing...",
 *   reasoning: "Rebuilding index after system update"
 * })
 * ```
 */
export const IndexStatusSchema = z
  .object({
    enabled: z.boolean(),
    status: z.string(),
    scanBaseTime: z.date().optional(),
    reasoning: z.string().optional()
  })
  .strict()

export type IndexStatus = z.infer<typeof IndexStatusSchema>
