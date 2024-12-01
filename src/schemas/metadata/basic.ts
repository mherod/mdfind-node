import { z } from 'zod'

// Basic file metadata schema
export const BasicMetadataSchema = z
  .object({
    path: z.string(),
    name: z.string(),
    size: z.number().optional(),
    created: z.date().optional(),
    modified: z.date().optional(),
    lastOpened: z.date().optional(),
    contentType: z.string().optional(),
    kind: z.string().optional()
  })
  .strict()

export type BasicMetadata = z.infer<typeof BasicMetadataSchema>

// Mapping from Spotlight attributes to basic metadata fields
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
