import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  IndexStatusSchema,
  MdutilOptionsSchema,
  type IndexStatus,
  type MdutilOptions
} from './schemas.js'

const execAsync = promisify(exec)

export class MdutilError extends Error {
  constructor(
    message: string,
    public readonly requiresRoot: boolean = false
  ) {
    super(message)
    this.name = 'MdutilError'
  }
}

const parseIndexingStatus = (output: string): IndexStatus => {
  const enabled = output.includes('Indexing enabled.')
  const scanBaseMatch = output.match(/Scan base time: ([^(]+)/)
  const reasoningMatch = output.match(/reasoning: '([^']+)'/)

  const result = {
    enabled,
    status: output.trim(),
    ...(scanBaseMatch && { scanBaseTime: new Date(scanBaseMatch[1]) }),
    ...(reasoningMatch && { reasoning: reasoningMatch[1] })
  }

  return IndexStatusSchema.parse(result)
}

/**
 * Get the indexing status of a volume
 */
export const getIndexingStatus = async (
  volumePath: string,
  options: MdutilOptions = {}
): Promise<IndexStatus> => {
  const validatedOptions = MdutilOptionsSchema.parse(options)
  const args = ['-s']
  if (validatedOptions.verbose) args.push('-v')
  args.push(volumePath)

  try {
    const { stdout } = await execAsync(`mdutil ${args.map(arg => `"${arg}"`).join(' ')}`)
    return parseIndexingStatus(stdout)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get indexing status: ${error.message}`)
    }
    throw error
  }
}

/**
 * Enable or disable indexing for a volume
 */
export const setIndexing = async (volumePath: string, enable: boolean): Promise<void> => {
  try {
    await execAsync(`mdutil -i ${enable ? 'on' : 'off'} "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(
        `Failed to ${enable ? 'enable' : 'disable'} indexing: ${error.message}`,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Erase and rebuild the index for a volume
 */
export const eraseAndRebuildIndex = async (volumePath: string): Promise<void> => {
  try {
    await execAsync(`mdutil -E "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(`Failed to erase and rebuild index: ${error.message}`, requiresRoot)
    }
    throw error
  }
}

/**
 * List the contents of the Spotlight index
 */
export const listIndexContents = async (volumePath: string): Promise<string> => {
  try {
    const { stdout } = await execAsync(`mdutil -L "${volumePath}"`)
    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(`Failed to list index contents: ${error.message}`, requiresRoot)
    }
    throw error
  }
}

/**
 * Flush local caches to network devices
 */
export const flushCaches = async (volumePath: string): Promise<void> => {
  try {
    await execAsync(`mdutil -p "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(`Failed to flush caches: ${error.message}`, requiresRoot)
    }
    throw error
  }
}

/**
 * Remove the Spotlight index directory
 */
export const removeIndex = async (volumePath: string): Promise<void> => {
  try {
    await execAsync(`mdutil -X "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(`Failed to remove index: ${error.message}`, requiresRoot)
    }
    throw error
  }
}
