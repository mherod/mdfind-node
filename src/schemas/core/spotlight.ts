import { z } from 'zod'

/**
 * Schema for Spotlight content types (UTIs).
 * Validates common Uniform Type Identifiers (UTIs) used by macOS Spotlight.
 * Also accepts custom UTIs as strings.
 *
 * Common types include:
 * - public.audio: Audio files (MP3, WAV, etc.)
 * - public.image: Image files (JPEG, PNG, etc.)
 * - public.movie: Video files (MP4, MOV, etc.)
 * - public.pdf: PDF documents
 * - public.plain-text: Plain text files
 * - public.rtf: Rich Text Format documents
 * - public.html: HTML documents
 * - public.font: Font files
 *
 * @example
 * ```typescript
 * // Using predefined types
 * const imageType = SpotlightContentTypeSchema.parse('public.image')
 * const audioType = SpotlightContentTypeSchema.parse('public.audio')
 *
 * // Using custom UTI
 * const customType = SpotlightContentTypeSchema.parse('com.adobe.photoshop')
 * ```
 */
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

/**
 * Schema for Spotlight metadata attributes.
 * Validates common metadata attribute names used in Spotlight queries.
 * Also accepts custom attribute names as strings.
 *
 * Attributes are grouped into categories:
 *
 * General attributes:
 * - kMDItemDisplayName: Display name of the file
 * - kMDItemFSName: Filesystem name
 * - kMDItemPath: Full path to the file
 * - kMDItemContentType: UTI content type
 * - kMDItemContentTypeTree: Hierarchy of content types
 * - kMDItemKind: Localized file type description
 * - kMDItemLastUsedDate: Last access date
 * - kMDItemContentCreationDate: Creation date
 * - kMDItemContentModificationDate: Modification date
 *
 * Document attributes:
 * - kMDItemTitle: Document title
 * - kMDItemAuthors: Author names
 * - kMDItemComment: User comments
 * - kMDItemCopyright: Copyright information
 * - kMDItemKeywords: Keywords/tags
 * - kMDItemNumberOfPages: Page count
 * - kMDItemLanguages: Document languages
 *
 * Media attributes:
 * - kMDItemDurationSeconds: Media duration
 * - kMDItemCodecs: Media codecs used
 * - kMDItemPixelHeight: Image height
 * - kMDItemPixelWidth: Image width
 * - kMDItemAudioBitRate: Audio bit rate
 * - kMDItemAudioChannelCount: Audio channels
 * - kMDItemTotalBitRate: Total media bit rate
 *
 * Image specific:
 * - kMDItemOrientation: Image orientation
 * - kMDItemFlashOnOff: Flash status
 * - kMDItemFocalLength: Lens focal length
 * - kMDItemAcquisitionMake: Camera manufacturer
 * - kMDItemAcquisitionModel: Camera model
 * - kMDItemISOSpeed: ISO speed rating
 * - kMDItemExposureTimeSeconds: Exposure time
 *
 * Location attributes:
 * - kMDItemLatitude: GPS latitude
 * - kMDItemLongitude: GPS longitude
 * - kMDItemAltitude: GPS altitude
 * - kMDItemCity: City name
 * - kMDItemStateOrProvince: State/province
 * - kMDItemCountry: Country name
 *
 * @example
 * Basic attribute usage:
 * ```typescript
 * const attr = SpotlightAttributeSchema.parse('kMDItemDisplayName')
 * ```
 *
 * @example
 * Custom attribute:
 * ```typescript
 * const customAttr = SpotlightAttributeSchema.parse('kMDItem_CustomAttribute')
 * ```
 */
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

/**
 * Schema for metadata query results.
 * Validates and transforms raw metadata values into appropriate types.
 *
 * Supported value types:
 * - Strings: Text values and identifiers
 * - Numbers: Numeric values and measurements
 * - Dates: Timestamps and calendar dates
 * - Booleans: True/false flags
 * - String arrays: Lists of values
 * - null: Missing or undefined values
 *
 * The schema includes automatic type coercion:
 * - String numbers are converted to numbers
 * - Date strings are parsed into Date objects
 * - Failed date parsing returns null
 *
 * @example
 * Parsing metadata results:
 * ```typescript
 * const result = MetadataResultSchema.parse({
 *   kMDItemDisplayName: "example.jpg",
 *   kMDItemPixelWidth: "1920",
 *   kMDItemContentCreationDate: "2024-01-01 12:00:00",
 *   kMDItemKeywords: ["vacation", "beach"]
 * })
 * ```
 */
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
