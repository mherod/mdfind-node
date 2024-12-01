import { z } from 'zod'

/**
 * Schema for XMP (Extensible Metadata Platform) metadata.
 * Validates and transforms XMP data commonly found in media files.
 *
 * Properties grouped by namespace:
 *
 * Dublin Core elements:
 * - creator: Content creator or author
 * - title: Resource title
 * - description: Resource description or caption
 * - subject: Keywords or tags (array)
 * - rights: Copyright information
 * - copyrightNotice: Formal copyright statement
 *
 * XMP Basic:
 * - rating: User-assigned rating (1-5)
 * - label: Color label or status tag
 * - createDate: Original creation date
 * - modifyDate: Last modification date
 * - metadataDate: Metadata modification date
 * - marked: Whether the file is marked/flagged
 *
 * Rights Management:
 * - webStatement: URL to copyright statement
 *
 * Color Management:
 * - colorMode: Color space identifier
 * - iccProfile: ICC profile name
 *
 * @example
 * Complete XMP data:
 * ```typescript
 * const xmp = XMPDataSchema.parse({
 *   creator: 'John Doe',
 *   title: 'Sunset at Beach',
 *   description: 'Beautiful sunset captured at Venice Beach',
 *   subject: ['nature', 'sunset', 'beach'],
 *   rights: 'All rights reserved',
 *   rating: 5,
 *   label: 'Winner',
 *   createDate: new Date('2024-01-01'),
 *   colorMode: 'RGB',
 *   iccProfile: 'sRGB IEC61966-2.1'
 * })
 * ```
 *
 * @example
 * Basic XMP data:
 * ```typescript
 * const xmp = XMPDataSchema.parse({
 *   creator: 'Jane Smith',
 *   title: 'Project Document',
 *   subject: ['work', 'draft'],
 *   createDate: new Date()
 * })
 * ```
 */
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

/**
 * Mapping from Spotlight attributes to XMP fields.
 * Used to transform Spotlight metadata into XMP format.
 *
 * Mappings:
 * - kMDItemAuthors → creator (content creator)
 * - kMDItemTitle → title (resource title)
 * - kMDItemDescription → description (resource description)
 * - kMDItemKeywords → subject (keywords/tags)
 * - kMDItemRating → rating (1-5 stars)
 * - kMDItemFinderComment → description (user comments)
 * - kMDItemContentCreationDate → createDate
 * - kMDItemContentModificationDate → modifyDate
 * - kMDItemCopyright → copyrightNotice
 * - kMDItemLabel → label (color label)
 * - kMDItemRights → rights (usage rights)
 * - kMDItemColorSpace → colorMode
 * - kMDItemICCProfile → iccProfile
 * - kMDItemWebStatement → webStatement (rights URL)
 * - kMDItemMetadataModificationDate → metadataDate
 * - kMDItemMarked → marked (flagged status)
 *
 * @example
 * Using the mapping:
 * ```typescript
 * const spotlightData = {
 *   kMDItemAuthors: 'John Doe',
 *   kMDItemTitle: 'Project Report',
 *   kMDItemKeywords: ['work', 'final'],
 *   kMDItemRating: 5,
 *   kMDItemContentCreationDate: new Date()
 * }
 *
 * const xmpData = {}
 * for (const [spotKey, xmpKey] of Object.entries(XMP_ATTRIBUTE_MAP)) {
 *   if (spotKey in spotlightData) {
 *     xmpData[xmpKey] = spotlightData[spotKey]
 *   }
 * }
 * ```
 */
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
