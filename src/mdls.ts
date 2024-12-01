import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  type MdlsOptions,
  MdlsOptionsSchema,
  type MetadataResult,
  MetadataResultSchema
} from './schemas/index.js'

const execAsync = promisify(exec)

/**
 * Parse raw mdls output with null character separators.
 * Used when the raw option is enabled to get unformatted values.
 *
 * @internal
 */
const parseRawMetadata = (output: string, nullMarker: string): Record<string, string | null> => {
  const result: Record<string, string | null> = {}
  const lines = output.split('\n')

  for (const line of lines) {
    const parts = line.split('=').map(s => s.trim())
    const key = parts[0]
    const value = parts[1]

    if (key && value !== undefined) {
      result[key] = value === nullMarker ? null : value
    }
  }

  return result
}

/**
 * Parse standard mdls output format into structured metadata.
 * Handles type coercion and array parsing.
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
    let value: string | number | boolean | Date | string[] | null = null

    // Remove surrounding quotes if present
    const cleanValue = rawValue.trim().replace(/^"(.*)"$/, '$1')

    // Parse arrays
    if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
      const arrayContent = cleanValue.slice(1, -1).trim()
      value = arrayContent ? arrayContent.split(',').map(s => s.trim()) : []
    }
    // Parse dates
    else if (cleanValue.includes('date') || cleanValue.includes('Date')) {
      try {
        value = new Date(cleanValue)
      } catch {
        value = null
      }
    }
    // Parse numbers
    else if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
      value = Number(cleanValue)
    }
    // Parse booleans
    else if (cleanValue === 'true' || cleanValue === 'false') {
      value = cleanValue === 'true'
    }
    // Keep as string
    else {
      value = cleanValue
    }

    result[cleanKey] = value
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
 *
 * @returns {Promise<MetadataResult | string[]>}
 *   - With raw=false: Object mapping attribute names to parsed values
 *   - With raw=true: Array of raw attribute values
 *
 * @throws {Error}
 *   - If the file doesn't exist
 *   - If the file can't be read
 *   - If mdls command fails
 *
 * @example
 * Get all metadata:
 * ```typescript
 * const metadata = await getMetadata('path/to/file.jpg')
 * console.log(metadata.kMDItemPixelHeight) // 1080
 * console.log(metadata.kMDItemContentCreationDate) // Date object
 * ```
 *
 * @example
 * Get specific attributes:
 * ```typescript
 * const metadata = await getMetadata('path/to/file.pdf', {
 *   attributes: [
 *     'kMDItemDisplayName',
 *     'kMDItemContentType',
 *     'kMDItemAuthors'
 *   ]
 * })
 * ```
 *
 * @example
 * Get raw values:
 * ```typescript
 * const values = await getMetadata('path/to/file.mp3', {
 *   raw: true,
 *   nullMarker: 'N/A'
 * })
 * ```
 */
export const getMetadata = async (
  filePath: string,
  options: MdlsOptions = {}
): Promise<MetadataResult> => {
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

    if (validatedOptions.raw) {
      return parseRawMetadata(stdout, validatedOptions.nullMarker || '(null)')
    }

    return parseFormattedMetadata(stdout)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get metadata: ${error.message}`)
    }
    throw error
  }
}
