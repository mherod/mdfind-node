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
 * Get extended metadata for a file, including basic file info, EXIF, and XMP data.
 * This function combines various metadata sources into a comprehensive object.
 *
 * @param {string} filePath - The path to the file to analyze
 * @param {ExtendedMetadataOptions} [options] - Configuration options for metadata extraction
 * @returns {Promise<ExtendedMetadata>} Comprehensive metadata object
 * @throws {Error} If metadata extraction fails or the file cannot be accessed
 *
 * @example
 * ```typescript
 * // Get all metadata
 * const metadata = await getExtendedMetadata('photo.jpg')
 * console.log('Camera:', metadata.exif.model)
 * console.log('Location:', metadata.exif.gpsLatitude, metadata.exif.gpsLongitude)
 * console.log('Author:', metadata.xmp.creator)
 *
 * // Get only specific metadata types
 * const partial = await getExtendedMetadata('document.pdf', {
 *   includeBasic: true,
 *   includeExif: false,
 *   includeXMP: true
 * })
 * ```
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
 * Get EXIF (Exchangeable Image File Format) data for a file.
 * This is particularly useful for photos and other image files.
 *
 * @param {string} filePath - The path to the file to analyze
 * @returns {Promise<ExifData>} EXIF metadata
 * @throws {Error} If metadata extraction fails
 *
 * @example
 * ```typescript
 * const exif = await getExifData('photo.jpg')
 * console.log('Camera:', exif.make, exif.model)
 * console.log('Settings:', {
 *   iso: exif.isoSpeedRatings,
 *   aperture: exif.fNumber,
 *   exposure: exif.exposureTime
 * })
 * ```
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
 * Get XMP (Extensible Metadata Platform) data for a file.
 * XMP provides rich metadata support for various file types.
 *
 * @param {string} filePath - The path to the file to analyze
 * @returns {Promise<XMPData>} XMP metadata
 * @throws {Error} If metadata extraction fails
 *
 * @example
 * ```typescript
 * const xmp = await getXMPData('document.pdf')
 * console.log('Title:', xmp.title)
 * console.log('Creator:', xmp.creator)
 * console.log('Keywords:', xmp.subject)
 * ```
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
 * Get basic file metadata like name, size, dates, etc.
 * This is the fastest metadata extraction option.
 *
 * @param {string} filePath - The path to the file to analyze
 * @returns {Promise<BasicMetadata>} Basic file metadata
 * @throws {Error} If metadata extraction fails
 *
 * @example
 * ```typescript
 * const info = await getBasicMetadata('file.txt')
 * console.log('Name:', info.name)
 * console.log('Size:', info.size)
 * console.log('Created:', info.created)
 * console.log('Modified:', info.modified)
 * ```
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
