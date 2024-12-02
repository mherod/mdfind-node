import { getMetadata } from './mdls.js'
import { type BasicMetadata, BasicMetadataSchema } from './schemas/metadata/basic.js'
import { type ExifData, ExifDataSchema } from './schemas/metadata/exif.js'
import { type ExtendedMetadata } from './schemas/metadata/index.js'
import { type XMPData, XMPDataSchema } from './schemas/metadata/xmp.js'

/**
 * Get basic metadata for a file.
 * @param filePath Path to the file
 * @returns Basic metadata including name, size, dates, and type
 */
export async function getBasicMetadata(filePath: string): Promise<BasicMetadata> {
  const result = (await getMetadata(filePath, { structured: true })) as ExtendedMetadata
  const metadata = result.spotlight
  return BasicMetadataSchema.parse({
    name: metadata.kMDItemDisplayName ?? metadata.kMDItemFSName ?? '',
    contentType: metadata.kMDItemContentType,
    kind: metadata.kMDItemKind,
    size: metadata.kMDItemFSSize ?? 0,
    created: metadata.kMDItemContentCreationDate,
    modified: metadata.kMDItemContentModificationDate,
    lastOpened: metadata.kMDItemLastUsedDate
  })
}

/**
 * Get EXIF metadata for an image file.
 * @param filePath Path to the image file
 * @returns EXIF metadata including camera info and settings
 */
export async function getExifData(filePath: string): Promise<ExifData> {
  const result = (await getMetadata(filePath, { structured: true })) as ExtendedMetadata
  const metadata = result.spotlight
  return ExifDataSchema.parse({
    make: metadata.kMDItemAcquisitionMake,
    model: metadata.kMDItemAcquisitionModel,
    lens: metadata.kMDItemLensModel,
    exposureTime: metadata.kMDItemExposureTimeSeconds,
    fNumber: metadata.kMDItemFNumber,
    isoSpeedRatings: metadata.kMDItemISOSpeed,
    focalLength: metadata.kMDItemFocalLength,
    gpsLatitude: metadata.kMDItemLatitude,
    gpsLongitude: metadata.kMDItemLongitude,
    gpsAltitude: metadata.kMDItemAltitude
  })
}

/**
 * Get XMP metadata for a file.
 * @param filePath Path to the file
 * @returns XMP metadata including document info and rights
 */
export async function getXMPData(filePath: string): Promise<XMPData> {
  const result = (await getMetadata(filePath, { structured: true })) as ExtendedMetadata
  const metadata = result.spotlight
  return XMPDataSchema.parse({
    title: metadata.kMDItemTitle,
    description: metadata.kMDItemDescription,
    creator: Array.isArray(metadata.kMDItemAuthors)
      ? metadata.kMDItemAuthors[0]
      : metadata.kMDItemAuthors,
    subject: metadata.kMDItemKeywords,
    createDate: metadata.kMDItemContentCreationDate,
    modifyDate: metadata.kMDItemContentModificationDate,
    metadataDate: metadata.kMDItemAttributeChangeDate,
    copyrightNotice: metadata.kMDItemCopyright,
    rights: metadata.kMDItemRights,
    webStatement: metadata.kMDItemURL
  })
}

/**
 * Get all available metadata for a file.
 * @param filePath Path to the file
 * @returns Combined metadata from basic, EXIF, and XMP sources
 */
export async function getExtendedMetadata(filePath: string): Promise<{
  basic: BasicMetadata
  exif: Partial<ExifData>
  xmp: Partial<XMPData>
}> {
  const [basic, exif, xmp] = await Promise.all([
    getBasicMetadata(filePath),
    getExifData(filePath).catch(() => ({})),
    getXMPData(filePath).catch(() => ({}))
  ])

  return {
    basic,
    exif,
    xmp
  }
}
