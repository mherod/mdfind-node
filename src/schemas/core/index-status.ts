import { z } from 'zod'

/**
 * Represents the possible states of Spotlight indexing
 */
export const IndexingStateSchema = z.enum(['enabled', 'disabled', 'unknown', 'error'])

export type IndexingState = z.infer<typeof IndexingStateSchema>

/**
 * Represents the status of Spotlight indexing for a volume
 */
export const IndexStatusSchema = z
  .object({
    /**
     * The current state of indexing
     */
    state: IndexingStateSchema,

    /**
     * Whether indexing is enabled (maintained for backward compatibility)
     */
    enabled: z.boolean(),

    /**
     * The raw status message from mdutil
     */
    status: z.string(),

    /**
     * The last time the volume was scanned
     */
    scanBaseTime: z.date().nullable().optional(),

    /**
     * The reason for the current state
     */
    reasoning: z.string().nullable().optional(),

    /**
     * The volume path that was checked
     */
    volumePath: z.string(),

    /**
     * Whether this volume is a system volume
     */
    isSystemVolume: z.boolean()
  })
  .strict()

export type IndexStatus = z.infer<typeof IndexStatusSchema>
