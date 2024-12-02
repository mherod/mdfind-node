import { z } from 'zod'
import { DateCoerceSchema } from '../core/date.js'

/**
 * Schema for basic file metadata.
 * Provides essential file information commonly used in file operations.
 *
 * Properties:
 * - name: Display name or filename
 * - contentType: UTI content type (e.g., 'public.image')
 * - kind: Localized file type description
 * - size: File size in bytes (0 if unavailable)
 * - created: Creation timestamp (null if unavailable)
 * - modified: Last modification timestamp (null if unavailable)
 * - lastOpened: Last access timestamp (null if unavailable)
 */
export const BasicMetadataSchema = z.object({
  name: z.string(),
  contentType: z.string().nullable().optional(),
  kind: z.string().nullable().optional(),
  size: z.number().optional(),
  created: DateCoerceSchema,
  modified: DateCoerceSchema,
  lastOpened: DateCoerceSchema
})

export type BasicMetadata = z.infer<typeof BasicMetadataSchema>

/**
 * Mapping from Spotlight attributes to basic metadata fields.
 * Used to transform raw Spotlight metadata into BasicMetadata format.
 */
export const BASIC_ATTRIBUTE_MAP = {
  kMDItemDisplayName: 'name',
  kMDItemFSName: 'name',
  kMDItemFSSize: 'size',
  kMDItemContentCreationDate: 'created',
  kMDItemContentModificationDate: 'modified',
  kMDItemLastUsedDate: 'lastOpened',
  kMDItemContentType: 'contentType',
  kMDItemKind: 'kind'
} as const satisfies Record<string, keyof BasicMetadata>
