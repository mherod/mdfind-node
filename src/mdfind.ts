import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import process from 'node:process'
import { type MdfindOptionsInput, MdfindOptionsSchema } from './schemas/index.js'
import { validateInput } from './validation.js'

export { mdfindLive } from './live-search.js'

/**
 * Expands ~ to the user's home directory in paths
 */
function expandPath(path: string): string {
  return path.replace(/^~/, homedir())
}

/**
 * Builds command line arguments for mdfind based on options
 */
function buildMdfindArgs(query: string, options: MdfindOptionsInput): string[] {
  const args: string[] = []

  if (options.onlyInDirectory) {
    args.push('-onlyin', expandPath(options.onlyInDirectory))
  }

  // Handle name options
  const names = options.names ?? []
  if (names.length > 0) {
    for (const name of names) {
      args.push('-name', name)
    }
  }

  // Handle attribute options
  const attributes = options.attributes ?? []
  if (attributes.length > 0) {
    for (const attr of attributes) {
      args.push('-attr', attr)
    }
  }

  if (options.smartFolder) {
    args.push('-s', options.smartFolder)
  }
  if (options.nullSeparator) {
    args.push('-0')
  }
  if (options.reprint) {
    args.push('-reprint')
  }
  if (options.literal) {
    args.push('-literal')
  }
  if (options.interpret) {
    args.push('-interpret')
  }
  if (options.count) {
    args.push('-count')
  }
  if (options.live) {
    args.push('-live')
  }

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    args.push(trimmedQuery)
  }

  return args
}

/**
 * Custom error class for mdfind-related errors.
 * Provides additional context from stderr output.
 */
export class MdfindError extends Error {
  public readonly name = 'MdfindError' as const

  constructor(
    message: string,
    public readonly stderr: string
  ) {
    super(message)
  }
}

const DEFAULT_OPTIONS: MdfindOptionsInput = {
  live: false,
  count: false,
  nullSeparator: false,
  maxBuffer: 1024 * 512,
  reprint: false,
  literal: false,
  interpret: false,
  names: [],
  attributes: [],
  onlyInDirectory: undefined,
  smartFolder: undefined
}

/**
 * Execute a Spotlight search using the mdfind command.
 * Returns an array of file paths that match the query.
 */
export function mdfind(query: string, options: MdfindOptionsInput = {}): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const validatedOptions = MdfindOptionsSchema.parse({ ...DEFAULT_OPTIONS, ...options })
    validateInput(query, validatedOptions)

    const args = buildMdfindArgs(query, validatedOptions)
    const child = spawn('mdfind', args, { env: process.env })
    let buffer = ''

    child.stdout.on('data', (data: Buffer) => {
      buffer += data.toString()
    })

    child.stderr.on('data', (data: Buffer) => {
      const stderr = data.toString()
      // Ignore locale loading messages
      if (!stderr.includes('[UserQueryParser] Loading keywords')) {
        reject(new MdfindError('mdfind command failed', stderr))
      }
    })

    child.on('close', () => {
      const separator = validatedOptions.nullSeparator ? '\0' : '\n'
      const paths = buffer.split(separator).filter(Boolean)
      resolve(paths)
    })
  })
}

/**
 * Get the count of files that match a Spotlight search query.
 * Returns the number of matching files without retrieving their paths.
 */
export function mdfindCount(query: string, options: MdfindOptionsInput = {}): Promise<number> {
  return new Promise((resolve, reject) => {
    const validatedOptions = MdfindOptionsSchema.parse({
      ...DEFAULT_OPTIONS,
      ...options,
      count: true
    })
    validateInput(query, validatedOptions)

    const args = buildMdfindArgs(query, validatedOptions)
    const child = spawn('mdfind', args, { env: process.env })
    let buffer = ''

    child.stdout.on('data', (data: Buffer) => {
      buffer += data.toString()
    })

    child.stderr.on('data', (data: Buffer) => {
      const stderr = data.toString()
      // Ignore locale loading messages
      if (!stderr.includes('[UserQueryParser] Loading keywords')) {
        reject(new MdfindError('mdfind command failed', stderr))
      }
    })

    child.on('close', () => {
      const count = parseInt(buffer.trim(), 10)
      resolve(isNaN(count) ? 0 : count)
    })
  })
}
