// Core types
export {
  SpotlightContentTypeSchema,
  SpotlightAttributeSchema,
  MetadataResultSchema,
  LiveSearchEventsSchema,
  MdfindErrorSchema,
  IndexStatusSchema,
  type SpotlightContentType,
  type SpotlightAttribute,
  type MetadataResult,
  type LiveSearchEvents,
  type IndexStatus
} from './core/index.js'

// Metadata schemas and types
export {
  BasicMetadataSchema,
  ExifDataSchema,
  XMPDataSchema,
  ExtendedMetadataSchema,
  type BasicMetadata,
  type ExifData,
  type XMPData,
  type ExtendedMetadata,
  type ExtendedMetadataOptions
} from './metadata/index.js'

// Command options schemas and types
export {
  MdfindOptionsSchema,
  MdlsOptionsSchema,
  MdutilOptionsSchema,
  type MdfindOptions,
  type MdlsOptions,
  type MdutilOptions
} from './options/index.js'
