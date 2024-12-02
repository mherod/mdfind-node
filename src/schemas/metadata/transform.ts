import type { MetadataResult } from '../core/spotlight.js'
import { DateCoerceSchema } from '../core/date.js'
import { type BasicMetadata, BasicMetadataSchema } from './basic.js'
import { type ExifData, ExifDataSchema } from './exif.js'
import { type XMPData, XMPDataSchema } from './xmp.js'

/**
 * Transform raw Spotlight metadata into basic metadata format.
 * Maps Spotlight attributes to their corresponding basic fields.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {BasicMetadata} Transformed basic metadata
 *
 * @internal
 */
export function transformBasicMetadata(metadata: MetadataResult): BasicMetadata {
  const transformed = {
    name: metadata.kMDItemDisplayName ?? metadata.kMDItemFSName ?? '',
    contentType: metadata.kMDItemContentType as string | undefined,
    kind: metadata.kMDItemKind as string | undefined,
    size: metadata.kMDItemFSSize as number | undefined,
    created: DateCoerceSchema.parse(metadata.kMDItemContentCreationDate),
    modified: DateCoerceSchema.parse(metadata.kMDItemContentModificationDate),
    lastOpened: DateCoerceSchema.parse(metadata.kMDItemLastUsedDate)
  }

  return BasicMetadataSchema.parse(transformed)
}

/**
 * Transform raw Spotlight metadata into EXIF format.
 * Maps Spotlight attributes to their corresponding EXIF fields.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {ExifData} Transformed EXIF metadata
 *
 * @internal
 */
export function transformExifMetadata(metadata: MetadataResult): ExifData {
  const transformed = {
    make: metadata.kMDItemAcquisitionMake as string | undefined,
    model: metadata.kMDItemAcquisitionModel as string | undefined,
    lens: metadata.kMDItemLensModel as string | undefined,
    exposureTime: metadata.kMDItemExposureTimeSeconds as number | undefined,
    fNumber: metadata.kMDItemFNumber as number | undefined,
    isoSpeedRatings: metadata.kMDItemISOSpeed as number | undefined,
    focalLength: metadata.kMDItemFocalLength as number | undefined,
    gpsLatitude: metadata.kMDItemLatitude as number | undefined,
    gpsLongitude: metadata.kMDItemLongitude as number | undefined,
    gpsAltitude: metadata.kMDItemAltitude as number | undefined,
    dateTimeOriginal: DateCoerceSchema.parse(metadata.kMDItemContentCreationDate),
    dateTimeDigitized: DateCoerceSchema.parse(metadata.kMDItemDateAdded)
  }

  return ExifDataSchema.parse(transformed)
}

/**
 * Transform raw Spotlight metadata into XMP format.
 * Maps Spotlight attributes to their corresponding XMP fields.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {XMPData} Transformed XMP metadata
 *
 * @internal
 */
export function transformXMPMetadata(metadata: MetadataResult): XMPData {
  const transformed = {
    title: metadata.kMDItemTitle as string | undefined,
    description: metadata.kMDItemDescription as string | undefined,
    creator: Array.isArray(metadata.kMDItemAuthors)
      ? metadata.kMDItemAuthors[0]
      : (metadata.kMDItemAuthors as string | undefined),
    subject: metadata.kMDItemKeywords as string[] | undefined,
    createDate: DateCoerceSchema.parse(metadata.kMDItemContentCreationDate),
    modifyDate: DateCoerceSchema.parse(metadata.kMDItemContentModificationDate),
    metadataDate: DateCoerceSchema.parse(metadata.kMDItemAttributeChangeDate),
    copyrightNotice: metadata.kMDItemCopyright as string | undefined,
    rights: metadata.kMDItemRights as string | undefined,
    webStatement: metadata.kMDItemURL as string | undefined
  }

  return XMPDataSchema.parse(transformed)
}
