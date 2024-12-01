import { z } from 'zod'
import { homedir } from 'os'

// Basic file metadata schema
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
