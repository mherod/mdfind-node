import { type MetadataResult } from '../core/index.js'
import { BASIC_ATTRIBUTE_MAP, type BasicMetadata } from './basic.js'
import { EXIF_ATTRIBUTE_MAP, type ExifData } from './exif.js'
import { XMP_ATTRIBUTE_MAP, type XMPData } from './xmp.js'

/**
 * Transform raw Spotlight metadata into BasicMetadata format.
 * Maps common file attributes to a standardized structure.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {BasicMetadata} Structured basic metadata
 *
 * @internal
 */
export function transformBasicMetadata(metadata: MetadataResult): BasicMetadata {
  const result: Partial<BasicMetadata> = {}

  for (const [spotKey, basicKey] of Object.entries(BASIC_ATTRIBUTE_MAP)) {
    if (spotKey in metadata) {
      const value = metadata[spotKey]
      if (value !== undefined) {
        result[basicKey] = value
      }
    }
  }

  return result as BasicMetadata
}

/**
 * Transform raw Spotlight metadata into EXIF format.
 * Maps image-specific attributes to EXIF structure.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {ExifData} Structured EXIF metadata
 *
 * @internal
 */
export function transformExifMetadata(metadata: MetadataResult): ExifData {
  const result: Partial<ExifData> = {}

  for (const [spotKey, exifKey] of Object.entries(EXIF_ATTRIBUTE_MAP)) {
    if (spotKey in metadata) {
      const value = metadata[spotKey]
      if (value !== undefined) {
        result[exifKey] = value as string | number | null
      }
    }
  }

  return result as ExifData
}

/**
 * Transform raw Spotlight metadata into XMP format.
 * Maps document and rights attributes to XMP structure.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {XMPData} Structured XMP metadata
 *
 * @internal
 */
export function transformXMPMetadata(metadata: MetadataResult): XMPData {
  const result: Partial<XMPData> = {}

  for (const [spotKey, xmpKey] of Object.entries(XMP_ATTRIBUTE_MAP)) {
    if (spotKey in metadata) {
      const value = metadata[spotKey]
      if (value !== undefined) {
        if (Array.isArray(value)) {
          result[xmpKey] = value
        } else if (value instanceof Date) {
          result[xmpKey] = value
        } else if (typeof value === 'string') {
          result[xmpKey] = value
        } else {
          result[xmpKey] = null
        }
      }
    }
  }

  return result as XMPData
}
