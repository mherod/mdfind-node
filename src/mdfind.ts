import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import process from 'node:process'
import { type MdfindOptionsInput, MdfindOptionsSchema } from './schemas/index.js'
import { validateInput } from './validation.js'

export { mdfindLive } from './live-search.js'

const expandPath = (path: string): string => path.replace(/^~/, homedir())

/**
 * Custom error class for mdfind-related errors.
 * Provides additional context from stderr output.
 *
 * Properties:
 * - message: Error description
 * - stderr: Raw error output from the command
 *
 * @example
 * ```typescript
 * try {
 *   await mdfind('invalid query')
 * } catch (error) {
 *   if (error instanceof MdfindError) {
 *     console.error('Search failed:', error.stderr)
 *   }
 * }
 * ```
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
 *
 * @param {string} query - The search query
 * @param {MdfindOptionsInput} options - Search options
 * @returns {Promise<string[]>} Array of matching file paths
 * @throws {MdfindError} If the search fails
 *
 * @example
 * Basic search:
 * ```typescript
 * const files = await mdfind('kind:image')
 * console.log('Found images:', files)
 * ```
 *
 * @example
 * Search with options:
 * ```typescript
 * const files = await mdfind('kind:document', {
 *   onlyIn: '~/Documents',
 *   name: '*.pdf',
 *   attr: 'kMDItemTitle'
 * })
 * ```
 */
export async function mdfind(query: string, options: MdfindOptionsInput = {}): Promise<string[]> {
  if (!query.trim() && (!options.name || options.names?.length === 0)) {
    throw new Error('Query cannot be empty unless using -name option')
  }

  const validatedOptions = MdfindOptionsSchema.parse({
    ...DEFAULT_OPTIONS,
    ...options
  })

  validateInput(query, validatedOptions)

  const args: string[] = []

  if (validatedOptions.onlyInDirectory) {
    args.push('-onlyin', expandPath(validatedOptions.onlyInDirectory))
  }
  if (validatedOptions.names.length > 0) {
    for (const name of validatedOptions.names) {
      args.push('-name', name)
    }
  }
  if (validatedOptions.attributes.length > 0) {
    for (const attr of validatedOptions.attributes) {
      args.push('-attr', attr)
    }
  }
  if (validatedOptions.smartFolder) {
    args.push('-s', validatedOptions.smartFolder)
  }
  if (validatedOptions.nullSeparator) {
    args.push('-0')
  }
  if (validatedOptions.reprint) {
    args.push('-reprint')
  }
  if (validatedOptions.literal) {
    args.push('-literal')
  }
  if (validatedOptions.interpret) {
    args.push('-interpret')
  }
  if (validatedOptions.count) {
    args.push('-count')
  }
  if (validatedOptions.live) {
    args.push('-live')
  }

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    args.push(trimmedQuery)
  }

  const child = spawn('mdfind', args, { env: process.env })

  return new Promise((resolve, reject) => {
    const results: string[] = []
    let buffer = ''

    child.stdout.on('data', (data: Buffer) => {
      buffer += data.toString()
      const lines = buffer.split(validatedOptions.nullSeparator ? '\0' : '\n')
      buffer = lines.pop() ?? ''
      results.push(...lines.filter(Boolean))
    })

    child.stderr.on('data', (data: Buffer) => {
      const stderr = data.toString()
      // Ignore locale loading messages
      if (!stderr.includes('[UserQueryParser] Loading keywords')) {
        reject(new MdfindError('mdfind command failed', stderr))
      }
    })

    child.on('close', (code: number) => {
      if (code !== 0) {
        reject(new MdfindError('mdfind exited with non-zero code', ''))
        return
      }
      if (buffer) {
        results.push(buffer)
      }
      resolve(results)
    })

    child.on('error', error => {
      reject(new MdfindError(error.message, ''))
    })
  })
}

/**
 * Execute a Spotlight search and return only the count of matches.
 *
 * @param {string} query - The Spotlight query to execute
 * @param {MdfindOptionsInput} [options] - Search configuration options
 * @returns {Promise<number>} Number of files matching the query
 *
 * @example
 * ```typescript
 * const count = await mdfindCount('kind:image')
 * console.log(`Found ${count} images`)
 * ```
 */
export async function mdfindCount(
  query: string,
  options: MdfindOptionsInput = {}
): Promise<number> {
  const validatedOptions = MdfindOptionsSchema.parse({
    ...DEFAULT_OPTIONS,
    ...options,
    count: true
  })
  validateInput(query, validatedOptions)

  const args: string[] = ['-count']

  if (validatedOptions.onlyInDirectory) {
    args.push('-onlyin', expandPath(validatedOptions.onlyInDirectory))
  }
  if (validatedOptions.names.length > 0) {
    for (const name of validatedOptions.names) {
      args.push('-name', name)
    }
  }
  if (validatedOptions.attributes.length > 0) {
    for (const attr of validatedOptions.attributes) {
      args.push('-attr', attr)
    }
  }
  if (validatedOptions.smartFolder) {
    args.push('-s', validatedOptions.smartFolder)
  }

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    args.push(trimmedQuery)
  }

  const child = spawn('mdfind', args, { env: process.env })

  return new Promise((resolve, reject) => {
    let output = ''

    child.stdout.on('data', (data: Buffer) => {
      output += data.toString()
    })

    child.stderr.on('data', (data: Buffer) => {
      const stderr = data.toString()
      // Ignore locale loading messages
      if (!stderr.includes('[UserQueryParser] Loading keywords')) {
        reject(new MdfindError('mdfind command failed', stderr))
      }
    })

    child.on('close', (code: number) => {
      if (code !== 0) {
        reject(new MdfindError('mdfind exited with non-zero code', ''))
        return
      }
      const count = parseInt(output.trim(), 10)
      if (isNaN(count)) {
        reject(new MdfindError('Failed to parse count from mdfind output', output))
        return
      }
      resolve(count)
    })

    child.on('error', error => {
      reject(new MdfindError(error.message, ''))
    })
  })
}
