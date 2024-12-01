import { type ChildProcess, exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { homedir } from 'os'

import { type LiveSearchEvents, LiveSearchEventsSchema } from './schemas/core/events.js'
import { MdfindOptionsSchema } from './schemas/options/index.js'
import type { MdfindOptions } from './schemas/index.js'

const execAsync = promisify(exec)

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

/**
 * Validate search options for compatibility.
 * Throws if incompatible options are provided.
 *
 * @internal
 */
const validateInput = (query: string, options: MdfindOptions): void => {
  if (options.live && options.count) {
    throw new Error('Cannot use live and count options together')
  }

  if (options.literal && options.interpret) {
    throw new Error('Cannot use literal and interpret options together')
  }

  if (options.name && !query.trim()) {
    // When using -name, query is optional
    return
  }

  if (!query.trim()) {
    throw new Error('Query cannot be empty unless using -name option')
  }
}

/**
 * Execute a Spotlight search using the mdfind command.
 * Returns an array of file paths that match the query.
 *
 * @param {string} query - The search query
 * @param {MdfindOptions} options - Search options
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
export const mdfind = async (query: string, options: MdfindOptions = {}): Promise<string[]> => {
  const validatedOptions = MdfindOptionsSchema.parse(options)
  validateInput(query, validatedOptions)

  const args: string[] = []

  if (validatedOptions.onlyIn) {
    args.push('-onlyin', expandPath(validatedOptions.onlyIn))
  }
  if (validatedOptions.name) {
    args.push('-name', validatedOptions.name)
  }
  if (validatedOptions.live) {
    args.push('-live')
  }
  if (validatedOptions.count) {
    args.push('-count')
  }
  if (validatedOptions.attr) {
    args.push('-attr', validatedOptions.attr)
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

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    args.push(trimmedQuery)
  }

  try {
    const { stdout, stderr } = await execAsync(`mdfind ${args.map(arg => `"${arg}"`).join(' ')}`, {
      maxBuffer: options.maxBuffer ?? 1024 * 1024 * 10 // 10MB default buffer
    })

    // mdfind sometimes outputs locale loading messages to stderr, which aren't errors
    if (stderr && !stderr.includes('[UserQueryParser] Loading keywords')) {
      throw new MdfindError('mdfind command failed', stderr)
    }

    // Split by newline or null character based on options
    const separator = options.nullSeparator ? '\0' : '\n'
    return stdout.trim().split(separator).filter(Boolean)
  } catch (error) {
    if (error instanceof Error) {
      // Define a type for the error object that includes stderr
      type ExecError = Error & { stderr?: string }
      throw new MdfindError(error.message, (error as ExecError).stderr ?? '')
    }
    throw error
  }
}

/**
 * Execute a live Spotlight search that monitors for changes in real-time.
 * Returns a ChildProcess that can be killed to stop monitoring.
 *
 * @param {string} query - The search query
 * @param {MdfindOptions} options - Search options
 * @param {LiveSearchEvents} events - Event handlers for results and errors
 * @returns {ChildProcess} The search process
 *
 * @example
 * ```typescript
 * const search = mdfindLive('kind:image', {
 *   onlyIn: '~/Pictures'
 * }, {
 *   onResult: paths => console.log('Found:', paths),
 *   onError: error => console.error('Error:', error),
 *   onEnd: () => console.log('Search ended')
 * })
 *
 * // Stop the search after 10 seconds
 * setTimeout(() => search.kill(), 10000)
 * ```
 */
export const mdfindLive = (
  query: string,
  options: MdfindOptions = {},
  events: LiveSearchEvents
): ChildProcess => {
  const validatedOptions = { ...options, live: true }
  const validatedEvents = LiveSearchEventsSchema.parse(events)
  validateInput(query, validatedOptions)

  const args: string[] = ['-live']

  if (validatedOptions.onlyIn) {
    args.push('-onlyin', expandPath(validatedOptions.onlyIn))
  }
  if (validatedOptions.name) {
    args.push('-name', validatedOptions.name)
  }
  if (validatedOptions.attr) {
    args.push('-attr', validatedOptions.attr)
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

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    args.push(trimmedQuery)
  }

  let buffer = ''
  const child = spawn('mdfind', args)

  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')

  child.stdout.on('data', (data: string) => {
    buffer += data
    const separator = validatedOptions.nullSeparator ? '\0' : '\n'
    const lines = buffer.split(separator)

    // Keep the last incomplete line in the buffer
    buffer = lines.pop() ?? ''

    const paths = lines.filter(Boolean)
    if (paths.length > 0) {
      validatedEvents.onResult(paths)
    }
  })

  child.stderr.on('data', (data: string) => {
    // Ignore locale loading messages
    if (!data.includes('[UserQueryParser] Loading keywords')) {
      validatedEvents.onError(new MdfindError('mdfind command failed', data))
    }
  })

  child.on('close', () => {
    // Process any remaining data in the buffer
    if (buffer) {
      const separator = validatedOptions.nullSeparator ? '\0' : '\n'
      const paths = buffer.split(separator).filter(Boolean)
      if (paths.length > 0) {
        validatedEvents.onResult(paths)
      }
    }
    validatedEvents.onEnd?.()
  })

  return child
}
