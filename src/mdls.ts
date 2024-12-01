import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  MdlsOptionsSchema,
  type MdlsOptions,
  type MetadataResult,
  MetadataResultSchema
} from './schemas/index.js'

const execAsync = promisify(exec)

const parseRawOutput = (output: string, nullMarker: string): string[] => {
  return output
    .split('\0')
    .map(value => (value === nullMarker ? null : value))
    .filter(Boolean) as string[]
}

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

export const getMetadata = async (
  filePath: string,
  options: MdlsOptions = {}
): Promise<MetadataResult | string[]> => {
  const validatedOptions = MdlsOptionsSchema.parse(options)
  const args: string[] = []

  if (validatedOptions.attributes?.length) {
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
