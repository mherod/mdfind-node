export * from './mdfind.js'
export * from './mdls.js'
export * from './mdutil.js'
export * from './mdimport.js'
export * from './query-builder.js'
export * from './batch.js'
export * from './batch-utils.js'
export * from './live-search.js'
export { getExtendedMetadata, getExifData, getXMPData, getBasicMetadata } from './metadata.js'
export {
  type SpotlightContentType,
  type SpotlightAttribute,
  type MdlsOptions,
  type MdutilOptions,
  type IndexStatus,
  type MetadataResult,
  type LiveSearchEvents,
  type ExifData,
  type XMPData,
  type ExtendedMetadata,
  type MdimportOptions,
  type MdimportResult,
  type ImporterInfo,
  type AttributeInfo
} from './schemas/index.js'

// Attribute discovery utilities
export {
  discoverAttributes,
  getContentTypes,
  getSpotlightAttributes,
  searchAttributes,
  getAttributesByCategory,
  getAttributeDefinition,
  getContentTypeDescription
} from './discover.js'
