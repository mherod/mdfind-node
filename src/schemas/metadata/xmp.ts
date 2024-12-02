import { z } from 'zod'
import { DateCoerceSchema } from '../core/date.js'

/**
 * Schema for XMP (Extensible Metadata Platform) metadata.
 * Validates and transforms XMP data commonly found in media files.
 */
export const XMPDataSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  creator: z.string().nullable().optional(),
  subject: z.array(z.string()).nullable().optional(),
  createDate: DateCoerceSchema,
  modifyDate: DateCoerceSchema,
  metadataDate: DateCoerceSchema,
  copyrightNotice: z.string().nullable().optional(),
  rights: z.string().nullable().optional(),
  webStatement: z.string().nullable().optional()
})

export type XMPData = z.infer<typeof XMPDataSchema>

/**
 * Mapping from Spotlight attributes to XMP fields.
 * Used to transform Spotlight metadata into XMP format.
 */
export const XMP_ATTRIBUTE_MAP = {
  kMDItemTitle: 'title',
  kMDItemDescription: 'description',
  kMDItemKeywords: 'subject',
  kMDItemContentCreationDate: 'createDate',
  kMDItemContentModificationDate: 'modifyDate',
  kMDItemCopyright: 'copyrightNotice',
  kMDItemRights: 'rights',
  kMDItemWebStatement: 'webStatement',
  kMDItemMetadataModificationDate: 'metadataDate'
} as const satisfies Record<string, keyof XMPData>
