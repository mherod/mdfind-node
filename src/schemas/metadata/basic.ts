import { z } from 'zod'
import { homedir } from 'os'

/**
 * Schema for basic file metadata.
 * Provides essential file information commonly used in file operations.
 *
 * Properties:
 * - path: Full path to the file (expands ~ to home directory)
 * - name: Display name or filename
 * - size: File size in bytes (0 if unavailable)
 * - created: Creation timestamp (null if unavailable)
 * - modified: Last modification timestamp (null if unavailable)
 * - lastOpened: Last access timestamp (null if unavailable)
 * - contentType: UTI content type (e.g., 'public.image')
 * - kind: Localized file type description
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
 *   path: '~/Documents/example.pdf',
 *   name: 'example.pdf',
 *   size: 1024,
 *   created: new Date('2024-01-01'),
 *   modified: new Date('2024-01-02'),
 *   contentType: 'com.adobe.pdf',
 *   kind: 'PDF Document'
 * })
 * ```
 *
 * @example
 * Minimal metadata:
 * ```typescript
 * const metadata = BasicMetadataSchema.parse({
 *   path: '/tmp/file.txt',
 *   name: 'file.txt'
 * })
 * ```
 *
 * @example
 * Handling invalid data:
 * ```typescript
 * const metadata = BasicMetadataSchema.parse({
 *   path: '~/file.txt',  // Will be expanded
 *   name: 'file.txt',
 *   size: 'invalid',     // Will be 0
 *   created: 'invalid'   // Will be null
 * })
 * ```
 */
export const BasicMetadataSchema = z
  .object({
    path: z.string().transform(p => p.replace(/^~/, homedir())),
    name: z.string(),
    size: z.coerce.number().catch(0).optional(),
    created: z.coerce.date().nullable().optional(),
    modified: z.coerce.date().nullable().optional(),
    lastOpened: z.coerce.date().nullable().optional(),
    contentType: z.string().optional(),
    kind: z.string().optional()
  })
  .strict()

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
