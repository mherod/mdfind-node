import { z } from 'zod'

// EXIF metadata schema
export const ExifDataSchema = z
  .object({
    // Camera information
    make: z.string().optional(),
    model: z.string().optional(),
    software: z.string().optional(),
    lens: z.string().optional(),

    // Timestamps
    dateTime: z.date().optional(),
    dateTimeOriginal: z.date().optional(),
    dateTimeDigitized: z.date().optional(),

    // Exposure settings
    exposureTime: z.number().optional(),
    fNumber: z.number().optional(),
    isoSpeedRatings: z.number().optional(),
    focalLength: z.number().optional(),
    focalLengthIn35mmFilm: z.number().optional(),
    flash: z.number().optional(),
    meteringMode: z.number().optional(),
    exposureProgram: z.number().optional(),
    whiteBalance: z.number().optional(),

    // GPS information
    gpsLatitude: z.number().optional(),
    gpsLongitude: z.number().optional(),
    gpsAltitude: z.number().optional()
  })
  .strict()

export type ExifData = z.infer<typeof ExifDataSchema>

// Mapping from Spotlight attributes to EXIF fields
export const EXIF_ATTRIBUTE_MAP = {
  kMDItemAcquisitionMake: 'make',
  kMDItemAcquisitionModel: 'model',
  kMDItemCreator: 'software',
  kMDItemExposureTimeSeconds: 'exposureTime',
  kMDItemFNumber: 'fNumber',
  kMDItemISOSpeed: 'isoSpeedRatings',
  kMDItemFocalLength: 'focalLength',
  kMDItemFlashOnOff: 'flash',
  kMDItemLatitude: 'gpsLatitude',
  kMDItemLongitude: 'gpsLongitude',
  kMDItemAltitude: 'gpsAltitude'
} as const satisfies Record<string, keyof ExifData>
