import { z } from 'zod'

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
 *
 * Features:
 * - Automatic home directory expansion in paths
 * - Size coercion to number with fallback to 0
 * - Date parsing with null fallback
 * - Optional fields for unavailable metadata
 *
 * @example
 * Basic file metadata:
 * ```typescript
 * const metadata = BasicMetadataSchema.parse({
 *   name: 'example.pdf',
 *   contentType: 'com.adobe.pdf',
 *   kind: 'PDF Document',
 *   size: 1024,
 *   created: new Date('2024-01-01'),
 *   modified: new Date('2024-01-02'),
 *   lastOpened: new Date('2024-01-03')
 * })
 * ```
 *
 * @example
 * Minimal metadata:
 * ```typescript
 * const metadata = BasicMetadataSchema.parse({
 *   name: 'file.txt',
 *   contentType: 'public.text'
 * })
 * ```
 *
 * @example
 * Handling invalid data:
 * ```typescript
 * const metadata = BasicMetadataSchema.parse({
 *   name: 'file.txt',
 *   contentType: 'public.text',
 *   size: 'invalid',
 *   created: 'invalid',
 *   modified: 'invalid',
 *   lastOpened: 'invalid'
 * })
 * ```
 */
export const BasicMetadataSchema = z.object({
  name: z.string(),
  contentType: z.string().nullable().optional(),
  kind: z.string().nullable().optional(),
  size: z.number().optional(),
  created: z
    .string()
    .transform(str => new Date(str))
    .nullable()
    .optional(),
  modified: z
    .string()
    .transform(str => new Date(str))
    .nullable()
    .optional(),
  lastOpened: z
    .string()
    .transform(str => new Date(str))
    .nullable()
    .optional()
})

export type BasicMetadata = z.infer<typeof BasicMetadataSchema>

/**
 * Mapping from Spotlight attributes to basic metadata fields.
 * Used to transform raw Spotlight metadata into BasicMetadata format.
 *
 * Mappings:
 * - kMDItemDisplayName → name (display name)
 * - kMDItemFSName → name (filesystem name)
 * - kMDItemFSSize → size (in bytes)
 * - kMDItemContentCreationDate → created
 * - kMDItemContentModificationDate → modified
 * - kMDItemLastUsedDate → lastOpened
 * - kMDItemContentType → contentType (UTI)
 * - kMDItemKind → kind (localized description)
 *
 * @example
 * Using the mapping:
 * ```typescript
 * const spotlightData = {
 *   kMDItemDisplayName: 'example.pdf',
 *   kMDItemFSSize: '1024',
 *   kMDItemContentType: 'com.adobe.pdf'
 * }
 *
 * const metadata = {}
 * for (const [spotKey, basicKey] of Object.entries(BASIC_ATTRIBUTE_MAP)) {
 *   if (spotKey in spotlightData) {
 *     metadata[basicKey] = spotlightData[spotKey]
 *   }
 * }
 * ```
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
