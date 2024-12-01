import { z } from 'zod'

// Common content types
export const SpotlightContentTypeSchema = z
  .enum([
    'public.audio',
    'public.image',
    'public.movie',
    'public.pdf',
    'public.plain-text',
    'public.rtf',
    'public.html',
    'public.font'
  ])
  .or(z.string())

// Common metadata attributes
export const SpotlightAttributeSchema = z
  .enum([
    // General attributes
    'kMDItemDisplayName',
    'kMDItemFSName',
    'kMDItemPath',
    'kMDItemContentType',
    'kMDItemContentTypeTree',
    'kMDItemKind',
    'kMDItemLastUsedDate',
    'kMDItemContentCreationDate',
    'kMDItemContentModificationDate',
    // Document attributes
    'kMDItemTitle',
    'kMDItemAuthors',
    'kMDItemComment',
    'kMDItemCopyright',
    'kMDItemKeywords',
    'kMDItemNumberOfPages',
    'kMDItemLanguages',
    // Media attributes
    'kMDItemDurationSeconds',
    'kMDItemCodecs',
    'kMDItemPixelHeight',
    'kMDItemPixelWidth',
    'kMDItemAudioBitRate',
    'kMDItemAudioChannelCount',
    'kMDItemTotalBitRate',
    // Image specific
    'kMDItemOrientation',
    'kMDItemFlashOnOff',
    'kMDItemFocalLength',
    'kMDItemAcquisitionMake',
    'kMDItemAcquisitionModel',
    'kMDItemISOSpeed',
    'kMDItemExposureTimeSeconds',
    // Location attributes
    'kMDItemLatitude',
    'kMDItemLongitude',
    'kMDItemAltitude',
    'kMDItemCity',
    'kMDItemStateOrProvince',
    'kMDItemCountry'
  ])
  .or(z.string())

// Options schemas
export const MdfindOptionsSchema = z
  .object({
    onlyIn: z.string().optional(),
    name: z.string().optional(),
    live: z.boolean().optional(),
    count: z.boolean().optional(),
    attr: SpotlightAttributeSchema.optional(),
    smartFolder: z.string().optional(),
    nullSeparator: z.boolean().optional(),
    maxBuffer: z.number().optional(),
    reprint: z.boolean().optional(),
    literal: z.boolean().optional(),
    interpret: z.boolean().optional()
  })
  .strict()

export const MdlsOptionsSchema = z
  .object({
    attributes: z.array(SpotlightAttributeSchema).optional(),
    raw: z.boolean().optional(),
    nullMarker: z.string().optional()
  })
  .strict()

export const MdutilOptionsSchema = z
  .object({
    verbose: z.boolean().optional()
  })
  .strict()

// Result schemas
export const IndexStatusSchema = z
  .object({
    enabled: z.boolean(),
    status: z.string(),
    scanBaseTime: z.date().optional(),
    reasoning: z.string().optional()
  })
  .strict()

export const MetadataResultSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.date(), z.boolean(), z.array(z.string()), z.null()])
)

// Error schemas
export const MdfindErrorSchema = z
  .object({
    name: z.literal('MdfindError'),
    message: z.string(),
    stderr: z.string()
  })
  .strict()

// Event schemas
export const LiveSearchEventsSchema = z
  .object({
    onResult: z.function().args(z.array(z.string())).returns(z.void()),
    onError: z.function().args(MdfindErrorSchema).returns(z.void()),
    onEnd: z.function().returns(z.void()).optional()
  })
  .strict()

// Export types
export type SpotlightContentType = z.infer<typeof SpotlightContentTypeSchema>
export type SpotlightAttribute = z.infer<typeof SpotlightAttributeSchema>
export type MdlsOptions = z.infer<typeof MdlsOptionsSchema>
export type MdutilOptions = z.infer<typeof MdutilOptionsSchema>
export type IndexStatus = z.infer<typeof IndexStatusSchema>
export type MetadataResult = z.infer<typeof MetadataResultSchema>
export type LiveSearchEvents = z.infer<typeof LiveSearchEventsSchema>

// Extended metadata schemas
export const ExifDataSchema = z
  .object({
    make: z.string().optional(),
    model: z.string().optional(),
    software: z.string().optional(),
    lens: z.string().optional(),
    dateTime: z.date().optional(),
    dateTimeOriginal: z.date().optional(),
    dateTimeDigitized: z.date().optional(),
    exposureTime: z.number().optional(),
    fNumber: z.number().optional(),
    isoSpeedRatings: z.number().optional(),
    focalLength: z.number().optional(),
    focalLengthIn35mmFilm: z.number().optional(),
    flash: z.number().optional(),
    meteringMode: z.number().optional(),
    exposureProgram: z.number().optional(),
    whiteBalance: z.number().optional(),
    gpsLatitude: z.number().optional(),
    gpsLongitude: z.number().optional(),
    gpsAltitude: z.number().optional()
  })
  .strict()

export const XMPDataSchema = z
  .object({
    creator: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    subject: z.array(z.string()).optional(),
    rating: z.number().optional(),
    label: z.string().optional(),
    rights: z.string().optional(),
    copyrightNotice: z.string().optional(),
    colorMode: z.string().optional(),
    iccProfile: z.string().optional(),
    webStatement: z.string().optional(),
    createDate: z.date().optional(),
    modifyDate: z.date().optional(),
    metadataDate: z.date().optional(),
    marked: z.boolean().optional()
  })
  .strict()

export const ExtendedMetadataSchema = z
  .object({
    basic: z.record(z.string(), z.unknown()),
    exif: ExifDataSchema,
    xmp: XMPDataSchema,
    spotlight: MetadataResultSchema
  })
  .strict()

export type ExifData = z.infer<typeof ExifDataSchema>
export type XMPData = z.infer<typeof XMPDataSchema>
export type ExtendedMetadata = z.infer<typeof ExtendedMetadataSchema>

export type MdfindOptions = z.infer<typeof MdfindOptionsSchema>
