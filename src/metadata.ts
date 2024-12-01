import { getMetadata } from './mdls.js'
import { z } from 'zod'
import { type MetadataResult, MetadataResultSchema } from './schemas.js'

// Extended metadata schemas
export const ExifDataSchema = z
  .object({
    make: z.string().optional(),
    model: z.string().optional(),
    software: z.string().optional(),
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
    gpsAltitude: z.number().optional(),
    lens: z.string().optional()
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
    createDate: z.date().optional(),
    modifyDate: z.date().optional(),
    metadataDate: z.date().optional(),
    rights: z.string().optional(),
    copyrightNotice: z.string().optional(),
    marked: z.boolean().optional(),
    webStatement: z.string().optional(),
    colorMode: z.string().optional(),
    iccProfile: z.string().optional()
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

export interface ExtendedMetadataOptions {
  includeBasic?: boolean
  includeExif?: boolean
  includeXMP?: boolean
  spotlightAttributes?: string[]
}

const EXIF_ATTRIBUTE_MAP = {
  kMDItemAcquisitionMake: 'make',
  kMDItemAcquisitionModel: 'model',
  kMDItemCreator: 'software',
  kMDItemExposureTimeSeconds: 'exposureTime',
  kMDItemFNumber: 'fNumber',
  kMDItemISOSpeed: 'isoSpeedRatings',
  kMDItemFocalLength: 'focalLength',
  kMDItemFlashOnOff: 'flash',
  kMDItemLatitude: 'gpsLatitude',
  kMDItemLongitude: 'gpsLongitude',
  kMDItemAltitude: 'gpsAltitude'
} as const

const XMP_ATTRIBUTE_MAP = {
  kMDItemAuthors: 'creator',
  kMDItemTitle: 'title',
  kMDItemDescription: 'description',
  kMDItemKeywords: 'subject',
  kMDItemRating: 'rating',
  kMDItemFinderComment: 'description',
  kMDItemContentCreationDate: 'createDate',
  kMDItemContentModificationDate: 'modifyDate',
  kMDItemCopyright: 'copyrightNotice'
} as const

/**
 * Get extended metadata for a file
 */
export const getExtendedMetadata = async (
  filePath: string,
  options: ExtendedMetadataOptions = {}
): Promise<ExtendedMetadata> => {
  const {
    includeBasic = true,
    includeExif = true,
    includeXMP = true,
    spotlightAttributes = []
  } = options

  // Get all metadata first
  const spotlightData = (await getMetadata(filePath, {
    attributes: spotlightAttributes.length ? spotlightAttributes : undefined
  })) as MetadataResult

  // Initialize result object
  const result: ExtendedMetadata = {
    basic: {},
    exif: {},
    xmp: {},
    spotlight: spotlightData
  }

  if (includeBasic) {
    // Extract basic file info
    result.basic = {
      path: filePath,
      name: spotlightData.kMDItemDisplayName || spotlightData.kMDItemFSName,
      size: spotlightData.kMDItemFSSize,
      created: spotlightData.kMDItemContentCreationDate,
      modified: spotlightData.kMDItemContentModificationDate,
      lastOpened: spotlightData.kMDItemLastUsedDate,
      contentType: spotlightData.kMDItemContentType,
      kind: spotlightData.kMDItemKind
    }
  }

  if (includeExif) {
    // Map Spotlight attributes to EXIF data
    const exifData: Partial<ExifData> = {}
    for (const [spotlightAttr, exifAttr] of Object.entries(EXIF_ATTRIBUTE_MAP)) {
      if (spotlightData[spotlightAttr] !== undefined) {
        exifData[exifAttr as keyof ExifData] = spotlightData[spotlightAttr]
      }
    }
    result.exif = ExifDataSchema.parse(exifData)
  }

  if (includeXMP) {
    // Map Spotlight attributes to XMP data
    const xmpData: Partial<XMPData> = {}
    for (const [spotlightAttr, xmpAttr] of Object.entries(XMP_ATTRIBUTE_MAP)) {
      if (spotlightData[spotlightAttr] !== undefined) {
        xmpData[xmpAttr as keyof XMPData] = spotlightData[spotlightAttr]
      }
    }
    result.xmp = XMPDataSchema.parse(xmpData)
  }

  return ExtendedMetadataSchema.parse(result)
}

/**
 * Get EXIF data for a file
 */
export const getExifData = async (filePath: string): Promise<ExifData> => {
  const metadata = await getExtendedMetadata(filePath, {
    includeBasic: false,
    includeExif: true,
    includeXMP: false
  })
  return metadata.exif
}

/**
 * Get XMP data for a file
 */
export const getXMPData = async (filePath: string): Promise<XMPData> => {
  const metadata = await getExtendedMetadata(filePath, {
    includeBasic: false,
    includeExif: false,
    includeXMP: true
  })
  return metadata.xmp
}

/**
 * Get basic file metadata
 */
export const getBasicMetadata = async (filePath: string): Promise<Record<string, unknown>> => {
  const metadata = await getExtendedMetadata(filePath, {
    includeBasic: true,
    includeExif: false,
    includeXMP: false
  })
  return metadata.basic
}
