import { z } from 'zod'
import { MetadataResultSchema } from '../core/spotlight.js'
import { BasicMetadataSchema, type BasicMetadata } from './basic.js'
import { ExifDataSchema, type ExifData } from './exif.js'
import { XMPDataSchema, type XMPData } from './xmp.js'

// Extended metadata schema that combines all metadata types
export const ExtendedMetadataSchema = z
  .object({
    basic: BasicMetadataSchema,
    exif: ExifDataSchema,
    xmp: XMPDataSchema,
    spotlight: MetadataResultSchema
  })
  .strict()

export type ExtendedMetadata = z.infer<typeof ExtendedMetadataSchema>

export interface ExtendedMetadataOptions {
  includeBasic?: boolean
  includeExif?: boolean
  includeXMP?: boolean
  spotlightAttributes?: string[]
}

export {
  BasicMetadataSchema,
  ExifDataSchema,
  XMPDataSchema,
  type BasicMetadata,
  type ExifData,
  type XMPData
}
