import { z } from 'zod'

/**
 * Schema for EXIF (Exchangeable Image File Format) metadata.
 * Validates and transforms EXIF data commonly found in image files.
 *
 * Properties grouped by category:
 *
 * Camera Information:
 * - make: Camera manufacturer (e.g., 'Canon', 'Nikon')
 * - model: Camera model name
 * - software: Software used to create/edit the image
 * - lens: Lens model used
 *
 * Timestamps:
 * - dateTime: File modification date
 * - dateTimeOriginal: When the photo was taken
 * - dateTimeDigitized: When the photo was digitized
 *
 * Exposure Settings:
 * - exposureTime: Shutter speed in seconds
 * - fNumber: Aperture value (f-stop)
 * - isoSpeedRatings: ISO sensitivity
 * - focalLength: Actual focal length in mm
 * - focalLengthIn35mmFilm: Equivalent focal length for 35mm
 * - flash: Flash status (numeric code)
 * - meteringMode: Light metering mode
 * - exposureProgram: Exposure program mode
 * - whiteBalance: White balance setting
 *
 * GPS Information:
 * - gpsLatitude: Latitude in decimal degrees
 * - gpsLongitude: Longitude in decimal degrees
 * - gpsAltitude: Altitude in meters
 *
 * @example
 * Complete EXIF data:
 * ```typescript
 * const exif = ExifDataSchema.parse({
 *   make: 'Canon',
 *   model: 'EOS R5',
 *   software: 'Adobe Photoshop',
 *   lens: 'RF 24-70mm F2.8L IS USM',
 *   dateTimeOriginal: new Date('2024-01-01T12:00:00'),
 *   exposureTime: 1/1000,
 *   fNumber: 2.8,
 *   isoSpeedRatings: 100,
 *   focalLength: 50,
 *   flash: 0,
 *   gpsLatitude: 37.7749,
 *   gpsLongitude: -122.4194
 * })
 * ```
 *
 * @example
 * Basic EXIF data:
 * ```typescript
 * const exif = ExifDataSchema.parse({
 *   make: 'Apple',
 *   model: 'iPhone 15 Pro',
 *   dateTimeOriginal: new Date(),
 *   gpsLatitude: 37.7749,
 *   gpsLongitude: -122.4194
 * })
 * ```
 */
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

/**
 * Mapping from Spotlight attributes to EXIF fields.
 * Used to transform Spotlight metadata into EXIF format.
 *
 * Mappings:
 * - kMDItemAcquisitionMake → make (camera manufacturer)
 * - kMDItemAcquisitionModel → model (camera model)
 * - kMDItemCreator → software (creation software)
 * - kMDItemExposureTimeSeconds → exposureTime (shutter speed)
 * - kMDItemFNumber → fNumber (aperture)
 * - kMDItemISOSpeed → isoSpeedRatings (ISO sensitivity)
 * - kMDItemFocalLength → focalLength (in mm)
 * - kMDItemFlashOnOff → flash (flash status)
 * - kMDItemLatitude → gpsLatitude (decimal degrees)
 * - kMDItemLongitude → gpsLongitude (decimal degrees)
 * - kMDItemAltitude → gpsAltitude (meters)
 *
 * @example
 * Using the mapping:
 * ```typescript
 * const spotlightData = {
 *   kMDItemAcquisitionMake: 'Canon',
 *   kMDItemAcquisitionModel: 'EOS R5',
 *   kMDItemFNumber: 2.8,
 *   kMDItemLatitude: 37.7749,
 *   kMDItemLongitude: -122.4194
 * }
 *
 * const exifData = {}
 * for (const [spotKey, exifKey] of Object.entries(EXIF_ATTRIBUTE_MAP)) {
 *   if (spotKey in spotlightData) {
 *     exifData[exifKey] = spotlightData[spotKey]
 *   }
 * }
 * ```
 */
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
