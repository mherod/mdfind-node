export {
  SpotlightContentTypeSchema,
  SpotlightAttributeSchema,
  MetadataResultSchema,
  LiveSearchEventsSchema,
  MdfindErrorSchema,
  IndexStatusSchema,
  IndexingStateSchema,
  type SpotlightContentType,
  type SpotlightAttribute,
  type MetadataResult,
  type LiveSearchEvents,
  type IndexStatus,
  type IndexingState
} from './core/index.js'

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

export {
  MdfindOptionsSchema,
  type MdfindOptionsInput,
  type MdfindOptions,
  MdlsOptionsSchema,
  MdutilOptionsSchema,
  MdimportOptionsSchema,
  type MdlsOptions,
  type MdutilOptions,
  type MdimportOptions
} from './options.js'

export {
  MdimportResultSchema,
  ImporterInfoSchema,
  AttributeInfoSchema,
  type MdimportResult,
  type ImporterInfo,
  type AttributeInfo
} from './core/mdimport.js'
