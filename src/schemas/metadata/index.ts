import { z } from 'zod'
import { MetadataResultSchema } from '../core/spotlight.js'
import { type BasicMetadata, BasicMetadataSchema } from './basic.js'
import { type ExifData, ExifDataSchema } from './exif.js'
import { type XMPData, XMPDataSchema } from './xmp.js'

// Extended metadata schema that combines all metadata types
export const ExtendedMetadataSchema = z.object({
  basic: BasicMetadataSchema,
  exif: ExifDataSchema.optional(),
  xmp: XMPDataSchema.optional(),
  spotlight: MetadataResultSchema
})

export type ExtendedMetadata = z.infer<typeof ExtendedMetadataSchema>

export interface ExtendedMetadataOptions {
  includeBasic?: boolean
  includeExif?: boolean
  includeXMP?: boolean
}

export {
  BasicMetadataSchema,
  ExifDataSchema,
  XMPDataSchema,
  type BasicMetadata,
  type ExifData,
  type XMPData
}
