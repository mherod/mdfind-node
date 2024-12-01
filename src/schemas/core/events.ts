import { z } from 'zod'

/**
 * Schema for mdfind error objects.
 * Validates the structure of errors thrown by mdfind operations.
 *
 * Properties:
 * - name: Always 'MdfindError'
 * - message: Human-readable error description
 * - stderr: Raw error output from the mdfind command
 *
 * @example
 * ```typescript
 * const error = MdfindErrorSchema.parse({
 *   name: 'MdfindError',
 *   message: 'Invalid query syntax',
 *   stderr: 'mdfind: invalid query'
 * })
 * ```
 */
export const MdfindErrorSchema = z
  .object({
    name: z.literal('MdfindError'),
    message: z.string(),
    stderr: z.string()
  })
  .strict()

/**
 * Schema for live search event handlers.
 * Validates the callback functions used in real-time file monitoring.
 *
 * Event handlers:
 * - onResult: Called when files are found or updated
 *   - Receives array of file paths
 *   - Called immediately with initial results
 *   - Called again when files change
 *
 * - onError: Called when search encounters an error
 *   - Receives MdfindError object
 *   - Search may continue after some errors
 *
 * - onEnd: Optional callback when search ends
 *   - Called when search is stopped
 *   - No arguments provided
 *
 * @example
 * Basic usage:
 * ```typescript
 * const events = LiveSearchEventsSchema.parse({
 *   onResult: (paths) => {
 *     console.log('Found files:', paths)
 *   },
 *   onError: (error) => {
 *     console.error('Search failed:', error.message)
 *   },
 *   onEnd: () => {
 *     console.log('Search ended')
 *   }
 * })
 * ```
 *
 * @example
 * Minimal handlers:
 * ```typescript
 * const events = LiveSearchEventsSchema.parse({
 *   onResult: (paths) => {
 *     console.log('Files:', paths)
 *   },
 *   onError: (error) => {
 *     console.error(error)
 *   }
 * })
 * ```
 */
export const LiveSearchEventsSchema = z
  .object({
    onResult: z.function().args(z.array(z.string())).returns(z.void()),
    onError: z.function().args(MdfindErrorSchema).returns(z.void()),
    onEnd: z.function().returns(z.void()).optional()
  })
  .strict()

export type LiveSearchEvents = z.infer<typeof LiveSearchEventsSchema>
