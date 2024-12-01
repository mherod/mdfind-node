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
const parseRawOutput = (
  stdout: string,
  nullMarker: string
): { [k: string]: string | number | boolean | Date | string[] | null } => {
  const lines = stdout.split('\n').filter(Boolean)
  const result: { [k: string]: string | number | boolean | Date | string[] | null } = {}

  for (const line of lines) {
    const [key, value] = line.split('=').map(s => s.trim())
    if (value === nullMarker) {
      result[key] = null
    } else {
      result[key] = value
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
const parseStandardOutput = (output: string): MetadataResult => {
  const result: Record<string, unknown> = {}
  const lines = output.split('\n')

  for (const line of lines) {
    const match = line.match(/^([^=]+)\s+=\s(.+)$/)
    if (!match) continue

    const [, key, rawValue] = match
    const cleanKey = key.trim()
    let value: unknown = null

    // Remove surrounding quotes if present
    const cleanValue = rawValue.trim().replace(/^"(.*)"$/, '$1')

    // Parse arrays
    if (cleanValue.startsWith('(') && cleanValue.endsWith(')')) {
      value = cleanValue
        .slice(1, -1)
        .split(',')
        .map(v => v.trim().replace(/^"(.*)"$/, '$1'))
    }
    // Parse dates
    else if (cleanValue.includes('0000-00-00')) {
      value = new Date(cleanValue)
    }
    // Parse numbers
    else if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
      value = Number(cleanValue)
    }
    // Parse booleans
    else if (cleanValue === '0' || cleanValue === '1') {
      value = cleanValue === '1'
    }
    // Everything else is a string
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
      return parseRawOutput(stdout, validatedOptions.nullMarker || '(null)')
    }

    return parseStandardOutput(stdout)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get metadata: ${error.message}`)
    }
    throw error
  }
}
