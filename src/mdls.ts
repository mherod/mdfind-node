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

    if (value === '(null)') {
      result[attr] = null
    } else if (value.startsWith('(') && value.endsWith(')')) {
      // Handle arrays
      const content = value.slice(1, -1).trim()
      result[attr] = content ? content.split(',').map(s => s.trim().replace(/^"(.*)"$/, '$1')) : []
    } else {
      result[attr] = value
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
      // Remove surrounding quotes if present
      result[cleanKey] = cleanValue.replace(/^"(.*)"$/, '$1')
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
 *
 * @returns {Promise<MetadataResult>}
 *   Object mapping attribute names to parsed values
 *
 * @throws {Error}
 *   - If the file doesn't exist
 *   - If the file can't be read
 *   - If mdls command fails
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
      return parseRawMetadata(stdout, validatedOptions.attributes)
    }

    return parseFormattedMetadata(stdout)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get metadata: ${error.message}`)
    }
    throw error
  }
}
