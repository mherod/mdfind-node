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

export const MetadataResultSchema = z
  .record(
    z.string(),
    z.union([
      z.string(),
      z.coerce.number(),
      z.coerce.date(),
      z.boolean(),
      z.array(z.string()),
      z.null()
    ])
  )
  .transform(obj => {
    // Clean up any failed coercions
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (value instanceof Date && isNaN(value.getTime())) {
          return [key, null]
        }
        return [key, value]
      })
    )
  })

export type SpotlightContentType = z.infer<typeof SpotlightContentTypeSchema>
export type SpotlightAttribute = z.infer<typeof SpotlightAttributeSchema>
export type MetadataResult = z.infer<typeof MetadataResultSchema>
