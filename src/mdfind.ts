import { exec, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import type { ChildProcess } from 'node:child_process'
import { homedir } from 'os'
import {
  LiveSearchEventsSchema,
  MdfindOptionsSchema,
  type LiveSearchEvents,
  type MdfindOptions
} from './schemas.js'

const execAsync = promisify(exec)

export class MdfindError extends Error {
  public readonly name = 'MdfindError' as const

  constructor(message: string, public readonly stderr: string) {
    super(message)
  }
}

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

const expandPath = (path: string): string => {
  if (path.startsWith('~/')) {
    return path.replace('~', homedir())
  }
  return path
}

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
      throw new MdfindError(error.message, (error as any).stderr || '')
    }
    throw error
  }
}

export const mdfindLive = (
  query: string,
  options: Omit<MdfindOptions, 'live' | 'count'>,
  events: LiveSearchEvents
): ChildProcess => {
  const validatedOptions = MdfindOptionsSchema.omit({ live: true, count: true }).parse(options)
  const validatedEvents = LiveSearchEventsSchema.parse(events)
  validateInput(query, { ...validatedOptions, live: true })

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

    const paths = lines.filter(line =>
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
      const paths = buffer.split(separator).filter(line =>
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