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

export type MdfindOptions = z.infer<typeof MdfindOptionsSchema>

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
