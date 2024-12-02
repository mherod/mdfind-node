import { z } from 'zod'
import { DateCoerceSchema } from '../core/date.js'

/**
 * Schema for EXIF (Exchangeable Image File Format) metadata.
 * Validates and transforms EXIF data commonly found in image files.
 */
export const ExifDataSchema = z.object({
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  lens: z.string().nullable().optional(),
  exposureTime: z.number().nullable().optional(),
  fNumber: z.number().nullable().optional(),
  isoSpeedRatings: z.number().nullable().optional(),
  focalLength: z.number().nullable().optional(),
  gpsLatitude: z.number().nullable().optional(),
  gpsLongitude: z.number().nullable().optional(),
  gpsAltitude: z.number().nullable().optional(),
  dateTimeOriginal: DateCoerceSchema,
  dateTimeDigitized: DateCoerceSchema
})

export type ExifData = z.infer<typeof ExifDataSchema>

/**
 * Mapping from Spotlight attributes to EXIF fields.
 * Used to transform Spotlight metadata into EXIF format.
 */
export const EXIF_ATTRIBUTE_MAP = {
  kMDItemAcquisitionMake: 'make',
  kMDItemAcquisitionModel: 'model',
  kMDItemLensModel: 'lens',
  kMDItemExposureTimeSeconds: 'exposureTime',
  kMDItemFNumber: 'fNumber',
  kMDItemISOSpeed: 'isoSpeedRatings',
  kMDItemFocalLength: 'focalLength',
  kMDItemLatitude: 'gpsLatitude',
  kMDItemLongitude: 'gpsLongitude',
  kMDItemAltitude: 'gpsAltitude',
  kMDItemContentCreationDate: 'dateTimeOriginal',
  kMDItemDateAdded: 'dateTimeDigitized'
} as const satisfies Record<string, keyof ExifData>
