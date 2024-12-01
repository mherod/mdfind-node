import { z } from 'zod'

// XMP metadata schema
export const XMPDataSchema = z
  .object({
    // Dublin Core elements
    creator: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    subject: z.array(z.string()).optional(),
    rights: z.string().optional(),
    copyrightNotice: z.string().optional(),

    // XMP Basic
    rating: z.number().optional(),
    label: z.string().optional(),
    createDate: z.date().optional(),
    modifyDate: z.date().optional(),
    metadataDate: z.date().optional(),
    marked: z.boolean().optional(),

    // Rights Management
    webStatement: z.string().optional(),

    // Color Management
    colorMode: z.string().optional(),
    iccProfile: z.string().optional()
  })
  .strict()

export type XMPData = z.infer<typeof XMPDataSchema>

// Mapping from Spotlight attributes to XMP fields
export const XMP_ATTRIBUTE_MAP = {
  kMDItemAuthors: 'creator',
  kMDItemTitle: 'title',
  kMDItemDescription: 'description',
  kMDItemKeywords: 'subject',
  kMDItemRating: 'rating',
  kMDItemFinderComment: 'description',
  kMDItemContentCreationDate: 'createDate',
  kMDItemContentModificationDate: 'modifyDate',
  kMDItemCopyright: 'copyrightNotice',
  kMDItemLabel: 'label',
  kMDItemRights: 'rights',
  kMDItemColorSpace: 'colorMode',
  kMDItemICCProfile: 'iccProfile',
  kMDItemWebStatement: 'webStatement',
  kMDItemMetadataModificationDate: 'metadataDate',
  kMDItemMarked: 'marked'
} as const satisfies Record<string, keyof XMPData>
