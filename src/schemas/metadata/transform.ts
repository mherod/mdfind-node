import { z } from 'zod'
import { type MetadataResult } from '../core/index.js'
import { type BasicMetadata } from './basic.js'
import { EXIF_ATTRIBUTE_MAP, type ExifData } from './exif.js'
import { XMP_ATTRIBUTE_MAP, type XMPData } from './xmp.js'

const ExifValueSchema = z.union([z.string(), z.number(), z.null()]).optional()

// Base types for XMP values
const XmpValueSchema = z
  .union([
    z.string(),
    z.number(),
    z.date(),
    z.array(z.string()),
    z.array(z.number()),
    z.record(z.string(), z.union([z.string(), z.number(), z.date()])),
    z.null()
  ])
  .optional()

// Dublin Core (dc) namespace
const DublinCoreSchema = z
  .object({
    title: z.string().optional(),
    creator: z.union([z.string(), z.array(z.string())]).optional(),
    description: z.string().optional(),
    subject: z.array(z.string()).optional(),
    publisher: z.string().optional(),
    contributor: z.union([z.string(), z.array(z.string())]).optional(),
    date: z.date().optional(),
    type: z.string().optional(),
    format: z.string().optional(),
    identifier: z.string().optional(),
    source: z.string().optional(),
    language: z.string().optional(),
    relation: z.string().optional(),
    coverage: z.string().optional(),
    rights: z.string().optional()
  })
  .optional()

// XMP Basic (xmp) namespace
const XmpBasicSchema = z
  .object({
    createDate: z.date().optional(),
    modifyDate: z.date().optional(),
    creatorTool: z.string().optional(),
    label: z.string().optional(),
    rating: z.number().optional(),
    metadataDate: z.date().optional()
  })
  .optional()

// XMP Rights Management (xmpRights) namespace
const XmpRightsSchema = z
  .object({
    certificate: z.string().optional(),
    marked: z.boolean().optional(),
    owner: z.union([z.string(), z.array(z.string())]).optional(),
    usageTerms: z.string().optional(),
    webStatement: z.string().optional()
  })
  .optional()

// XMP Media Management (xmpMM) namespace
const XmpMediaManagementSchema = z
  .object({
    documentID: z.string().optional(),
    instanceID: z.string().optional(),
    originalDocumentID: z.string().optional(),
    renditionClass: z.string().optional(),
    renditionParams: z.string().optional(),
    versionID: z.string().optional(),
    versions: z
      .array(
        z.object({
          action: z.string(),
          parameters: z.string().optional(),
          when: z.date(),
          softwareAgent: z.string().optional()
        })
      )
      .optional()
  })
  .optional()

const BasicMetadataTransformSchema = z.object({
  name: z.string(),
  contentType: z.string().nullable().optional(),
  kind: z.string().nullable().optional(),
  size: z.number().optional(),
  created: z.date().nullable().optional(),
  modified: z.date().nullable().optional(),
  lastOpened: z.date().nullable().optional(),
  lastUsed: z.date().nullable().optional()
})

const ExifMetadataTransformSchema = z.object(
  Object.fromEntries(
    Object.entries(EXIF_ATTRIBUTE_MAP).map(([_spotKey, exifKey]) => [exifKey, ExifValueSchema])
  )
)

const XmpMetadataTransformSchema = z.object({
  ...Object.fromEntries(
    Object.entries(XMP_ATTRIBUTE_MAP).map(([_spotKey, xmpKey]) => [xmpKey, XmpValueSchema])
  ),
  dc: DublinCoreSchema,
  xmp: XmpBasicSchema,
  xmpRights: XmpRightsSchema,
  xmpMM: XmpMediaManagementSchema
})

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
  const usedDates = metadata.kMDItemUsedDates as Date[] | undefined
  const lastUsed = usedDates?.length ? usedDates[0] : null

  const transformed = {
    name: metadata.kMDItemDisplayName as string,
    contentType: metadata.kMDItemContentType as string | null,
    kind: metadata.kMDItemKind as string | null,
    size: metadata.kMDItemFSSize as number | undefined,
    created: metadata.kMDItemFSCreationDate as Date | null,
    modified: metadata.kMDItemFSContentChangeDate as Date | null,
    lastOpened: metadata.kMDItemLastUsedDate as Date | null,
    lastUsed
  }
  return BasicMetadataTransformSchema.parse(transformed)
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
  const transformed = Object.fromEntries(
    Object.entries(EXIF_ATTRIBUTE_MAP)
      .filter(([spotKey]) => spotKey in metadata)
      .map(([spotKey, exifKey]) => [exifKey, metadata[spotKey]])
  )
  return ExifMetadataTransformSchema.parse(transformed)
}

/**
 * Transform raw Spotlight metadata into XMP format.
 * Maps document and rights attributes to XMP structure.
 * Includes support for multiple XMP namespaces including:
 * - Dublin Core (dc)
 * - XMP Basic (xmp)
 * - XMP Rights Management (xmpRights)
 * - XMP Media Management (xmpMM)
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {XMPData} Structured XMP metadata including all supported namespaces
 *
 * @internal
 */
export function transformXMPMetadata(metadata: MetadataResult): XMPData {
  const transformed = {
    ...Object.fromEntries(
      Object.entries(XMP_ATTRIBUTE_MAP)
        .filter(([spotKey]) => spotKey in metadata)
        .map(([spotKey, xmpKey]) => [xmpKey, metadata[spotKey]])
    ),
    dc: extractDublinCore(metadata),
    xmp: extractXmpBasic(metadata),
    xmpRights: extractXmpRights(metadata),
    xmpMM: extractXmpMediaManagement(metadata)
  }
  return XmpMetadataTransformSchema.parse(transformed)
}

/**
 * Extract Dublin Core metadata elements from Spotlight metadata.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {object} Dublin Core metadata elements
 *
 * @internal
 */
function extractDublinCore(metadata: MetadataResult): z.infer<typeof DublinCoreSchema> {
  return {
    title: metadata.kMDItemTitle as string | undefined,
    creator: metadata.kMDItemAuthors as string[] | undefined,
    description: metadata.kMDItemDescription as string | undefined,
    subject: metadata.kMDItemKeywords as string[] | undefined,
    rights: metadata.kMDItemCopyright as string | undefined,
    date: metadata.kMDItemContentCreationDate as Date | undefined,
    type: metadata.kMDItemContentType as string | undefined,
    format: metadata.kMDItemContentType as string | undefined
  }
}

/**
 * Extract XMP Basic metadata from Spotlight metadata.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {object} XMP Basic metadata elements
 *
 * @internal
 */
function extractXmpBasic(metadata: MetadataResult): z.infer<typeof XmpBasicSchema> {
  return {
    createDate: metadata.kMDItemContentCreationDate as Date | undefined,
    modifyDate: metadata.kMDItemContentModificationDate as Date | undefined,
    creatorTool: metadata.kMDItemCreator as string | undefined,
    metadataDate: metadata.kMDItemAttributeChangeDate as Date | undefined
  }
}

/**
 * Extract XMP Rights Management metadata from Spotlight metadata.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {object} XMP Rights Management metadata elements
 *
 * @internal
 */
function extractXmpRights(metadata: MetadataResult): z.infer<typeof XmpRightsSchema> {
  return {
    marked: metadata.kMDItemCopyright != null,
    owner: metadata.kMDItemCopyrightHolder as string | undefined,
    usageTerms: metadata.kMDItemRights as string | undefined
  }
}

/**
 * Extract XMP Media Management metadata from Spotlight metadata.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {object} XMP Media Management metadata elements
 *
 * @internal
 */
function extractXmpMediaManagement(
  metadata: MetadataResult
): z.infer<typeof XmpMediaManagementSchema> {
  return {
    documentID: metadata.kMDItemIdentifier as string | undefined,
    instanceID: metadata.kMDItemFSNodeCount as string | undefined
  }
}
