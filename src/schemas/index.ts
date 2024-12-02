export {
  IndexStatusSchema,
  IndexingStateSchema,
  LiveSearchEventsSchema,
  MdfindErrorSchema,
  MetadataResultSchema,
  SpotlightAttributeSchema,
  SpotlightContentTypeSchema,
  type IndexStatus,
  type IndexingState,
  type LiveSearchEvents,
  type MetadataResult,
  type SpotlightAttribute,
  type SpotlightContentType
} from './core/index.js'

export {
  BasicMetadataSchema,
  ExifDataSchema,
  ExtendedMetadataSchema,
  XMPDataSchema,
  type BasicMetadata,
  type ExifData,
  type ExtendedMetadata,
  type ExtendedMetadataOptions,
  type XMPData
} from './metadata/index.js'

export {
  MdfindOptionsOutputSchema,
  MdfindOptionsSchema,
  MdimportOptionsSchema,
  MdlsOptionsSchema,
  MdutilOptionsSchema,
  type MdfindOptions,
  type MdfindOptionsInput,
  type MdimportOptions,
  type MdlsOptions,
  type MdutilOptions
} from './options.js'

export {
  AttributeInfoSchema,
  ImporterInfoSchema,
  MdimportResultSchema,
  type AttributeInfo,
  type ImporterInfo,
  type MdimportResult
} from './core/mdimport.js'
