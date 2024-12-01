import { getMetadata } from './mdls.js'
import {
  type MetadataResult,
  type ExtendedMetadata,
  type ExtendedMetadataOptions,
  ExtendedMetadataSchema,
  BasicMetadataSchema,
  ExifDataSchema,
  XMPDataSchema
} from './schemas/index.js'
import { BASIC_ATTRIBUTE_MAP } from './schemas/metadata/basic.js'
import { EXIF_ATTRIBUTE_MAP } from './schemas/metadata/exif.js'
import { XMP_ATTRIBUTE_MAP } from './schemas/metadata/xmp.js'

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
    basic: BasicMetadataSchema.parse({
      path: filePath,
      name:
        spotlightData.kMDItemDisplayName ||
        spotlightData.kMDItemFSName ||
        filePath.split('/').pop() ||
        ''
    }),
    exif: ExifDataSchema.parse({}),
    xmp: XMPDataSchema.parse({}),
    spotlight: spotlightData
  }

  if (includeBasic) {
    // Map Spotlight attributes to basic metadata
    const basicData: Record<string, unknown> = { path: filePath }
    for (const [spotlightAttr, basicAttr] of Object.entries(BASIC_ATTRIBUTE_MAP)) {
      const value = spotlightData[spotlightAttr]
      if (value !== undefined && value !== null) {
        basicData[basicAttr] = value
      }
    }
    result.basic = BasicMetadataSchema.parse(basicData)
  }

  if (includeExif) {
    // Map Spotlight attributes to EXIF data
    const exifData: Record<string, unknown> = {}
    for (const [spotlightAttr, exifAttr] of Object.entries(EXIF_ATTRIBUTE_MAP)) {
      const value = spotlightData[spotlightAttr]
      if (value !== undefined && value !== null) {
        exifData[exifAttr] = value
      }
    }
    result.exif = ExifDataSchema.parse(exifData)
  }

  if (includeXMP) {
    // Map Spotlight attributes to XMP data
    const xmpData: Record<string, unknown> = {}
    for (const [spotlightAttr, xmpAttr] of Object.entries(XMP_ATTRIBUTE_MAP)) {
      const value = spotlightData[spotlightAttr]
      if (value !== undefined && value !== null) {
        if (xmpAttr === 'subject' && Array.isArray(value)) {
          xmpData[xmpAttr] = value.filter((v): v is string => typeof v === 'string')
        } else {
          xmpData[xmpAttr] = value
        }
      }
    }
    result.xmp = XMPDataSchema.parse(xmpData)
  }

  return ExtendedMetadataSchema.parse(result)
}

/**
 * Get EXIF data for a file
 */
export const getExifData = async (filePath: string) => {
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
export const getXMPData = async (filePath: string) => {
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
export const getBasicMetadata = async (filePath: string) => {
  const metadata = await getExtendedMetadata(filePath, {
    includeBasic: true,
    includeExif: false,
    includeXMP: false
  })
  return metadata.basic
}

export { type ExtendedMetadataOptions }
