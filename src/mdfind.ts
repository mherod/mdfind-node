import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import type { ChildProcess } from 'node:child_process'
import { homedir } from 'os'
import { MdfindOptionsSchema } from './schemas/options/index.js'
import { LiveSearchEventsSchema, type LiveSearchEvents } from './schemas/core/events.js'
import type { MdfindOptions } from './schemas/index.js'

const execAsync = promisify(exec)

/**
 * Custom error class for mdfind-related errors.
 * Provides additional context about the error through the stderr output.
 *
 * @example
 * ```typescript
 * try {
 *   await mdfind('invalid:query')
 * } catch (error) {
 *   if (error instanceof MdfindError) {
 *     console.error('Search failed:', error.message)
 *     console.error('Command output:', error.stderr)
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
 * Validates the search query and options for consistency.
 * Throws an error if the configuration is invalid.
 *
 * @internal
 */
const validateInput = (query: string, options: MdfindOptions) => {
  if (options.live && options.count) {
    throw new Error('Cannot use live and count options together')
  }

  if (options.reprint && !options.live) {
    throw new Error('reprint option requires live option')
  }

  if (options.literal && options.interpret) {
    throw new Error('Cannot use literal and interpret options together')
  }

  if (options.name && !query.trim().length) {
    // When using -name, query is optional
    return
  }

  if (!query.trim().length) {
    throw new Error('Query cannot be empty unless using -name option')
  }
}

/**
 * Expands the tilde (~) in paths to the user's home directory.
 *
 * @internal
 */
const expandPath = (path: string): string => {
  if (path.startsWith('~/')) {
    return path.replace('~', homedir())
  }
  return path
}

/**
 * Execute a Spotlight search using the macOS mdfind command.
 * This function provides access to macOS's powerful file and metadata search capabilities.
 *
 * @param {string} query - The Spotlight query to execute. This can be:
 *   - A simple text search (e.g., "typescript")
 *   - A metadata attribute query (e.g., "kMDItemContentType == 'public.image'")
 *   - A natural language query with -interpret (e.g., "images created today")
 *
 * @param {MdfindOptions} options - Configuration options:
 *   - onlyIn: Limit search to a specific directory
 *   - name: Search by filename pattern
 *   - live: Enable real-time updates
 *   - count: Return only the count of matches
 *   - attr: Return specific metadata attributes
 *   - smartFolder: Use a saved search
 *   - nullSeparator: Use null character as separator
 *   - maxBuffer: Maximum buffer size for results
 *   - reprint: Reprint results in live mode
 *   - literal: Disable special query interpretation
 *   - interpret: Enable natural language interpretation
 *
 * @returns {Promise<string[]>} Array of file paths matching the query
 *
 * @throws {MdfindError}
 *   - If the query is invalid
 *   - If options are incompatible
 *   - If mdfind command fails
 *   - If buffer size is exceeded
 *
 * @example
 * Basic text search:
 * ```typescript
 * const files = await mdfind('typescript')
 * ```
 *
 * @example
 * Search with metadata attributes:
 * ```typescript
 * const images = await mdfind(
 *   'kMDItemContentType == "public.image" && kMDItemPixelHeight > 1080',
 *   { onlyIn: '~/Pictures' }
 * )
 * ```
 *
 * @example
 * Natural language search:
 * ```typescript
 * const docs = await mdfind(
 *   'documents modified today',
 *   { interpret: true }
 * )
 * ```
 *
 * @example
 * Get specific metadata:
 * ```typescript
 * const dates = await mdfind(
 *   'kind:image',
 *   {
 *     interpret: true,
 *     attr: 'kMDItemContentCreationDate'
 *   }
 * )
 * ```
 */
export const mdfind = async (query: string, options: MdfindOptions = {}): Promise<string[]> => {
  const validatedOptions = MdfindOptionsSchema.parse(options)
  validateInput(query, validatedOptions)

  const args: string[] = []

  if (validatedOptions.onlyIn) args.push('-onlyin', expandPath(validatedOptions.onlyIn))
  if (validatedOptions.name) args.push('-name', validatedOptions.name)
  if (validatedOptions.live) args.push('-live')
  if (validatedOptions.count) args.push('-count')
  if (validatedOptions.attr) args.push('-attr', validatedOptions.attr)
  if (validatedOptions.smartFolder) args.push('-s', validatedOptions.smartFolder)
  if (validatedOptions.nullSeparator) args.push('-0')
  if (validatedOptions.reprint) args.push('-reprint')
  if (validatedOptions.literal) args.push('-literal')
  if (validatedOptions.interpret) args.push('-interpret')

  // Add the query at the end if it's not empty
  if (query.trim().length) {
    args.push(query.trim())
  }

  try {
    const { stdout, stderr } = await execAsync(`mdfind ${args.map(arg => `"${arg}"`).join(' ')}`, {
      maxBuffer: validatedOptions.maxBuffer || 1024 * 1024 * 10 // 10MB default buffer
    })

    // mdfind sometimes outputs locale loading messages to stderr, which aren't errors
    const realError = stderr && !stderr.includes('[UserQueryParser] Loading keywords')
    if (realError) {
      throw new MdfindError('mdfind command failed', stderr)
    }

    // Split by newline or null character based on options
    const separator = validatedOptions.nullSeparator ? '\0' : '\n'
    return stdout.trim().split(separator).filter(Boolean)
  } catch (error) {
    if (error instanceof Error) {
      // Define a type for the error object that includes stderr
      type ExecError = Error & { stderr?: string }
      throw new MdfindError(error.message, (error as ExecError).stderr || '')
    }
    throw error
  }
}

/**
 * Execute a live Spotlight search that monitors for changes in real-time.
 * This function starts a long-running process that emits events when files matching
 * the query are created, modified, or deleted.
 *
 * @param {string} query - The Spotlight query to execute (same format as mdfind)
 *
 * @param {Omit<MdfindOptions, 'live' | 'count'>} options - Configuration options:
 *   - onlyIn: Limit monitoring to a specific directory
 *   - name: Monitor by filename pattern
 *   - attr: Return specific metadata attributes
 *   - smartFolder: Use a saved search
 *   - nullSeparator: Use null character as separator
 *   - reprint: Reprint all results when changes occur
 *   - literal: Disable special query interpretation
 *   - interpret: Enable natural language interpretation
 *
 * @param {LiveSearchEvents} events - Event handlers:
 *   - onResult: Called with array of file paths when matches are found
 *   - onError: Called when an error occurs
 *   - onEnd: Optional callback when the search ends
 *
 * @returns {ChildProcess} The spawned mdfind process
 *   - Use process.kill() to stop monitoring
 *   - Process automatically ends when parent process exits
 *
 * @throws {MdfindError}
 *   - If the query is invalid
 *   - If options are incompatible
 *   - If mdfind command fails to start
 *
 * @example
 * Monitor for new images:
 * ```typescript
 * const search = mdfindLive(
 *   'kMDItemContentType == "public.image"',
 *   { onlyIn: '~/Pictures' },
 *   {
 *     onResult: paths => {
 *       console.log('New or modified images:', paths)
 *     },
 *     onError: error => {
 *       console.error('Search error:', error.message)
 *     },
 *     onEnd: () => {
 *       console.log('Search ended')
 *     }
 *   }
 * )
 *
 * // Stop monitoring after 5 minutes
 * setTimeout(() => {
 *   search.kill()
 * }, 5 * 60 * 1000)
 * ```
 *
 * @example
 * Monitor with metadata attributes:
 * ```typescript
 * const search = mdfindLive(
 *   'kMDItemContentType == "public.audio"',
 *   {
 *     attr: 'kMDItemDurationSeconds',
 *     reprint: true
 *   },
 *   {
 *     onResult: paths => {
 *       console.log('Audio files with duration:', paths)
 *     }
 *   }
 * )
 * ```
 */
export const mdfindLive = (
  query: string,
  options: Omit<MdfindOptions, 'live' | 'count'>,
  events: LiveSearchEvents
): ChildProcess => {
  const validatedOptions = MdfindOptionsSchema.parse({
    ...options,
    live: true,
    count: false
  })
  const validatedEvents = LiveSearchEventsSchema.parse(events)
  validateInput(query, validatedOptions)

  const args: string[] = []

  if (validatedOptions.onlyIn) args.push('-onlyin', expandPath(validatedOptions.onlyIn))
  if (validatedOptions.name) args.push('-name', validatedOptions.name)
  if (validatedOptions.attr) args.push('-attr', validatedOptions.attr)
  if (validatedOptions.smartFolder) args.push('-s', validatedOptions.smartFolder)
  if (validatedOptions.nullSeparator) args.push('-0')
  if (validatedOptions.reprint) args.push('-reprint')
  if (validatedOptions.literal) args.push('-literal')
  if (validatedOptions.interpret) args.push('-interpret')

  // Always add live for this function
  args.push('-live')

  // Add the query at the end if it's not empty
  if (query.trim().length) {
    args.push(query.trim())
  }

  const child = spawn('mdfind', args, {
    stdio: ['ignore', 'pipe', 'pipe']
  })

  let buffer = ''
  let isFirstChunk = true
  let resultsStarted = false

  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')

  child.stdout.on('data', (data: string) => {
    // Skip the control message at the end
    if (data.includes('[Type ctrl-C to exit]')) {
      const parts = data.split('[Type ctrl-C to exit]')
      buffer += parts[0]
      resultsStarted = true
    } else {
      buffer += data
    }

    if (!resultsStarted && !buffer.includes('[Type ctrl-C to exit]')) {
      return
    }

    const separator = validatedOptions.nullSeparator ? '\0' : '\n'
    const lines = buffer.split(separator)

    // Keep the last incomplete line in the buffer
    buffer = lines.pop() || ''

    const paths = lines.filter(
      line =>
        line.trim() &&
        !line.includes('[UserQueryParser]') &&
        !line.includes('[Type ctrl-C to exit]')
    )

    if (paths.length > 0 || isFirstChunk) {
      validatedEvents.onResult(paths)
      isFirstChunk = false
    }
  })

  child.stderr.on('data', (data: string) => {
    const stderr = data.toString()
    if (!stderr.includes('[UserQueryParser] Loading keywords')) {
      validatedEvents.onError(new MdfindError('mdfind command failed', stderr))
    }
  })

  child.on('close', () => {
    // Process any remaining data in the buffer
    if (buffer.length > 0) {
      const separator = validatedOptions.nullSeparator ? '\0' : '\n'
      const paths = buffer
        .split(separator)
        .filter(
          line =>
            line.trim() &&
            !line.includes('[UserQueryParser]') &&
            !line.includes('[Type ctrl-C to exit]')
        )
      if (paths.length > 0) {
        validatedEvents.onResult(paths)
      }
    }
    if (validatedEvents.onEnd) {
      validatedEvents.onEnd()
    }
  })

  return child
}
