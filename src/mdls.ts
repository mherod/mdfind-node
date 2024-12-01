import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  type ExtendedMetadata,
  ExtendedMetadataSchema,
  type MdlsOptions,
  MdlsOptionsSchema,
  type MetadataResult,
  MetadataResultSchema
} from './schemas/index.js'
import {
  transformBasicMetadata,
  transformExifMetadata,
  transformXMPMetadata
} from './schemas/metadata/transform.js'

const execAsync = promisify(exec)

/**
 * Coerce a value to a date if the attribute name suggests it contains a date.
 * @internal
 */
function coerceDate(value: string, key: string): Date | null {
  if (!key.includes('Date') && !key.includes('date')) return null
  try {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date
    }
  } catch {
    // Fall through
  }
  return null
}

/**
 * Coerce a value to a number if the attribute name suggests it contains a numeric value.
 * @internal
 */
function coerceNumber(value: string, key: string): number | null {
  if (
    !key.includes('Size') &&
    !key.includes('Count') &&
    !key.includes('Number') &&
    !key.includes('BitRate') &&
    !key.includes('Duration') &&
    !key.includes('Height') &&
    !key.includes('Width') &&
    !key.includes('Length') &&
    !key.includes('Speed') &&
    !key.includes('Time')
  ) {
    return null
  }
  const num = Number(value)
  return isNaN(num) ? null : num
}

/**
 * Coerce a value to appropriate type based on attribute name and content.
 * @internal
 */
function coerceValue(
  value: string,
  key: string
): string | number | boolean | Date | string[] | null {
  const cleanValue = value.replace(/^"(.*)"$/, '$1')

  // Try date coercion first
  const dateValue = coerceDate(cleanValue, key)
  if (dateValue) return dateValue

  // Try number coercion
  const numValue = coerceNumber(cleanValue, key)
  if (numValue !== null) return numValue

  // Handle booleans
  if (cleanValue === 'true' || cleanValue === 'false') {
    return cleanValue === 'true'
  }

  // Keep as string
  return cleanValue
}

/**
 * Parse raw mdls output.
 * Raw output concatenates values without separators.
 * We need to match values to the requested attributes in order.
 *
 * @internal
 */
const parseRawMetadata = (
  output: string,
  attributes: string[]
): Record<string, string | number | boolean | Date | string[] | null> => {
  const result: Record<string, string | number | boolean | Date | string[] | null> = {}
  const values = output.trim().split('\0')

  // Map values to attributes
  for (let i = 0; i < attributes.length && i < values.length; i++) {
    const value = values[i]
    const attr = attributes[i]

    if (!value || !attr) continue

    if (value === '(null)') {
      result[attr] = null
    } else if (value.startsWith('(') && value.endsWith(')')) {
      // Handle arrays
      const content = value.slice(1, -1).trim()
      result[attr] = content ? content.split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')) : []
    } else {
      result[attr] = coerceValue(value, attr)
    }
  }

  return MetadataResultSchema.parse(result)
}

/**
 * Parse standard mdls output format into structured metadata.
 * Uses Zod schema for type coercion.
 *
 * @internal
 */
const parseFormattedMetadata = (output: string): MetadataResult => {
  const result: Record<string, string | number | boolean | Date | string[] | null> = {}
  const lines = output.split('\n')

  for (const line of lines) {
    const match = line.match(/^([^=]+)=\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (!key || rawValue === undefined) continue

    const cleanKey = key.trim()
    const cleanValue = rawValue.trim()

    if (cleanValue === '(null)') {
      result[cleanKey] = null
    } else if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
      // Handle arrays
      const content = cleanValue.slice(1, -1).trim()
      result[cleanKey] = content
        ? content.split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1'))
        : []
    } else {
      result[cleanKey] = coerceValue(cleanValue, cleanKey)
    }
  }

  return MetadataResultSchema.parse(result)
}

/**
 * Get metadata for a file using the macOS mdls command.
 * Retrieves Spotlight metadata attributes and their values.
 *
 * @param {string} filePath - Path to the file to get metadata for
 * @param {MdlsOptions} [options] - Configuration options:
 *   - attributes: List of specific attributes to retrieve
 *   - raw: Return raw attribute values without parsing
 *   - nullMarker: String to use for null values
 *   - structured: Return metadata in structured format (basic, EXIF, XMP)
 *
 * @returns {Promise<MetadataResult | ExtendedMetadata>}
 *   Object mapping attribute names to parsed values, or structured metadata
 *
 * @throws {Error}
 *   - If the file doesn't exist
 *   - If the file can't be read
 *   - If mdls command fails
 *
 * @example
 * Get raw metadata:
 * ```typescript
 * const metadata = await getMetadata('photo.jpg')
 * console.log(metadata.kMDItemPixelHeight)
 * ```
 *
 * @example
 * Get structured metadata:
 * ```typescript
 * const metadata = await getMetadata('photo.jpg', { structured: true })
 * console.log(metadata.basic.name)
 * console.log(metadata.exif.focalLength)
 * console.log(metadata.xmp.creator)
 * ```
 */
export const getMetadata = async (
  filePath: string,
  options: MdlsOptions = {
    attributes: [],
    raw: false,
    nullMarker: '(null)',
    structured: false
  }
): Promise<MetadataResult | ExtendedMetadata> => {
  const validatedOptions = MdlsOptionsSchema.parse(options)
  const args: string[] = []

  if (validatedOptions.attributes.length > 0) {
    for (const attr of validatedOptions.attributes) {
      args.push('-name', attr)
    }
  }

  if (validatedOptions.raw) {
    args.push('-raw')
    if (validatedOptions.nullMarker) {
      args.push('-nullMarker', validatedOptions.nullMarker)
    }
  }

  args.push(filePath)

  try {
    const { stdout } = await execAsync(`mdls ${args.map(arg => `"${arg}"`).join(' ')}`)

    const rawMetadata = validatedOptions.raw
      ? parseRawMetadata(stdout, validatedOptions.attributes)
      : parseFormattedMetadata(stdout)

    if (validatedOptions.structured) {
      return ExtendedMetadataSchema.parse({
        basic: transformBasicMetadata(rawMetadata),
        exif: transformExifMetadata(rawMetadata),
        xmp: transformXMPMetadata(rawMetadata),
        spotlight: rawMetadata
      })
    }

    return rawMetadata
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get metadata: ${error.message}`)
    }
    throw error
  }
}
