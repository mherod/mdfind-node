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
 * A live search stream that yields file paths incrementally as an async iterable.
 * Call `stop()` to terminate the underlying mdfind process.
 */
export interface LiveSearchStream extends AsyncIterable<string> {
  /** The underlying child process. */
  readonly process: ChildProcess
  /** Stop the live search and close the stream. */
  stop(): void
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

/**
 * Execute a live Spotlight search that yields results incrementally as an async iterable.
 * Each yielded value is a single file path string. The caller can consume results
 * with `for await...of` without buffering the entire result set.
 *
 * @param {string} query - The search query
 * @param {MdfindOptionsInput} options - Search options
 * @returns {LiveSearchStream} An async iterable of file paths with a `stop()` method
 *
 * @example
 * ```typescript
 * const stream = mdfindStream('kind:image', { onlyIn: '~/Pictures' })
 *
 * for await (const filePath of stream) {
 *   process.stderr.write(`Found: ${filePath}\n`)
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Stop after collecting 10 results
 * const stream = mdfindStream('kind:pdf')
 * const results: string[] = []
 *
 * for await (const filePath of stream) {
 *   results.push(filePath)
 *   if (results.length >= 10) {
 *     stream.stop()
 *   }
 * }
 * ```
 */
export function mdfindStream(query: string, options: MdfindOptionsInput = {}): LiveSearchStream {
  const validatedOptions = MdfindOptionsSchema.parse({ ...DEFAULT_OPTIONS, ...options, live: true })
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
  const separator = validatedOptions.nullSeparator ? '\0' : '\n'

  const pending: string[] = []
  let waiting: ((value: IteratorResult<string>) => void) | null = null
  let done = false
  let error: Error | null = null
  let lineBuffer = ''

  const push = (path: string): void => {
    if (waiting) {
      const resolve = waiting
      waiting = null
      resolve({ value: path, done: false })
    } else {
      pending.push(path)
    }
  }

  const finish = (): void => {
    done = true
    if (waiting) {
      const resolve = waiting
      waiting = null
      resolve({ value: undefined as unknown as string, done: true })
    }
  }

  const fail = (err: Error): void => {
    error = err
    done = true
    if (waiting) {
      const resolve = waiting
      waiting = null
      resolve({ value: undefined as unknown as string, done: true })
    }
  }

  child.stdout.on('data', (data: Buffer) => {
    lineBuffer += data.toString()
    const lines = lineBuffer.split(separator)
    lineBuffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.length > 0) {
        push(line)
      }
    }
  })

  child.stderr.on('data', (data: Buffer) => {
    const stderr = data.toString()
    if (!stderr.includes('[UserQueryParser] Loading keywords')) {
      fail(new MdfindError('mdfind command failed', stderr))
    }
  })

  child.on('close', () => {
    if (lineBuffer) {
      const remaining = lineBuffer.split(separator).filter(Boolean)
      for (const path of remaining) {
        push(path)
      }
      lineBuffer = ''
    }
    finish()
  })

  const asyncIterator: AsyncIterator<string> = {
    next(): Promise<IteratorResult<string>> {
      if (error) {
        return Promise.reject(error)
      }
      if (pending.length > 0) {
        const value = pending.shift() as string
        return Promise.resolve({ value, done: false })
      }
      if (done) {
        return Promise.resolve({ value: undefined as unknown as string, done: true })
      }
      return new Promise(resolve => {
        waiting = resolve
      })
    },
    return(): Promise<IteratorResult<string>> {
      child.kill()
      done = true
      pending.length = 0
      return Promise.resolve({ value: undefined as unknown as string, done: true })
    }
  }

  return {
    [Symbol.asyncIterator]() {
      return asyncIterator
    },
    stop() {
      child.kill()
    },
    get process() {
      return child
    }
  }
}
