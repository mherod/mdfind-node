export * from './mdfind.js'
export * from './mdls.js'
export * from './mdutil.js'
export * from './query-builder.js'
export * from './batch.js'
export {
  getExtendedMetadata,
  getExifData,
  getXMPData,
  getBasicMetadata,
  type ExtendedMetadataOptions
} from './metadata.js'
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
  type ExtendedMetadata
} from './schemas/index.js'

// Attribute discovery utilities
export {
  discoverAttributes,
  getContentTypes,
  getSpotlightAttributes,
  searchAttributes,
  getAttributesByCategory,
  getAttributeDefinition,
  getContentTypeDescription,
  type SpotlightAttributeDefinition
} from './discover.js'
