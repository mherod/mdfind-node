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
  gpsAltitude: z.number().nullable().optional()
})

export type ExifData = z.infer<typeof ExifDataSchema>

/**
 * Mapping from Spotlight attributes to EXIF fields.
 * Used to transform Spotlight metadata into EXIF format.
 *
 * Mappings:
 * - kMDItemAcquisitionMake → make (camera manufacturer)
 * - kMDItemAcquisitionModel → model (camera model)
 * - kMDItemLensModel → lens (lens model)
 * - kMDItemExposureTimeSeconds → exposureTime (shutter speed)
 * - kMDItemFNumber → fNumber (aperture)
 * - kMDItemISOSpeed → isoSpeedRatings (ISO sensitivity)
 * - kMDItemFocalLength → focalLength (in mm)
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
  kMDItemLensModel: 'lens',
  kMDItemExposureTimeSeconds: 'exposureTime',
  kMDItemFNumber: 'fNumber',
  kMDItemISOSpeed: 'isoSpeedRatings',
  kMDItemFocalLength: 'focalLength',
  kMDItemLatitude: 'gpsLatitude',
  kMDItemLongitude: 'gpsLongitude',
  kMDItemAltitude: 'gpsAltitude'
} as const satisfies Record<string, keyof ExifData>
