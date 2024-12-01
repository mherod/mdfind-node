import { z } from 'zod'
import { MetadataResultSchema } from '../core/spotlight.js'
import { type BasicMetadata, BasicMetadataSchema } from './basic.js'
import { type ExifData, ExifDataSchema } from './exif.js'
import { type XMPData, XMPDataSchema } from './xmp.js'

// Extended metadata schema that combines all metadata types
export const ExtendedMetadataSchema = z.object({
  basic: BasicMetadataSchema,
  exif: ExifDataSchema,
  xmp: XMPDataSchema,
  spotlight: MetadataResultSchema
})

export type ExtendedMetadata = z.infer<typeof ExtendedMetadataSchema>

export interface ExtendedMetadataOptions {
  includeBasic?: boolean
  includeExif?: boolean
  includeXMP?: boolean
}

export {
  type BasicMetadata,
  BasicMetadataSchema,
  type ExifData,
  ExifDataSchema,
  type XMPData,
  XMPDataSchema
}
