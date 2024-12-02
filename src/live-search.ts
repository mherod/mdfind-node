import { Buffer } from 'node:buffer'
import { type ChildProcess, spawn } from 'node:child_process'
import process from 'node:process'
import { MdfindError } from './mdfind.js'
import {
  type LiveSearchEvents,
  LiveSearchEventsSchema,
  type MdfindOptionsInput,
  MdfindOptionsSchema
} from './schemas/index.js'
import { expandPath } from './utils/index.js'
import { validateInput } from './validation.js'

const DEFAULT_OPTIONS: MdfindOptionsInput = {
  live: false,
  count: false,
  nullSeparator: false,
  maxBuffer: 1024 * 1024,
  reprint: false,
  literal: false,
  interpret: false,
  names: [],
  attributes: [],
  onlyInDirectory: undefined,
  smartFolder: undefined
}

/**
 * Execute a live Spotlight search that monitors for changes in real-time.
 * Returns a ChildProcess that can be killed to stop monitoring.
 *
 * @param {string} query - The search query
 * @param {MdfindOptionsInput} options - Search options
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
export function mdfindLive(
  query: string,
  options: MdfindOptionsInput = {},
  events: LiveSearchEvents
): ChildProcess {
  const validatedOptions = MdfindOptionsSchema.parse({ ...DEFAULT_OPTIONS, ...options, live: true })
  const validatedEvents = LiveSearchEventsSchema.parse(events)
  validateInput(query, validatedOptions)

  const args: string[] = ['-live']

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

  const trimmedQuery = query.trim()
  if (trimmedQuery) {
    args.push(trimmedQuery)
  }

  const child = spawn('mdfind', args, { env: process.env })
  let buffer = ''

  child.stdout.on('data', (data: Buffer) => {
    buffer += data.toString()
    const separator = validatedOptions.nullSeparator ? '\0' : '\n'
    const lines = buffer.split(separator)

    // Keep the last incomplete line in the buffer
    buffer = lines.pop() ?? ''

    const paths = lines.filter(line => line.length > 0)
    if (paths.length > 0) {
      validatedEvents.onResult(paths)
    }
  })

  child.stderr.on('data', (data: Buffer) => {
    const stderr = data.toString()
    // Ignore locale loading messages
    if (!stderr.includes('[UserQueryParser] Loading keywords')) {
      validatedEvents.onError(new MdfindError('mdfind command failed', stderr))
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
