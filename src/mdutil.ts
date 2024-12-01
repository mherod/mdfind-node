import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import {
  IndexStatusSchema,
  MdutilOptionsSchema,
  type IndexStatus,
  type MdutilOptions
} from './schemas/index.js'

const execAsync = promisify(exec)

/**
 * Error class for mdutil-related errors.
 * Contains information about whether root privileges are required.
 */
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
 * Get the Spotlight indexing status of a volume.
 * This function checks whether indexing is enabled and provides additional status information.
 *
 * @param {string} volumePath - The path to the volume to check
 * @param {MdutilOptions} [options] - Configuration options
 * @returns {Promise<IndexStatus>} The indexing status
 * @throws {MdutilError} If the status check fails
 *
 * @example
 * ```typescript
 * // Check indexing status
 * const status = await getIndexingStatus('/')
 * console.log('Indexing enabled:', status.enabled)
 * console.log('Last scan:', status.scanBaseTime)
 *
 * // Get verbose status
 * const verbose = await getIndexingStatus('/', { verbose: true })
 * console.log('Status:', verbose.status)
 * console.log('Reasoning:', verbose.reasoning)
 * ```
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
 * Enable or disable Spotlight indexing for a volume.
 * Some operations may require root privileges.
 *
 * @param {string} volumePath - The path to the volume to modify
 * @param {boolean} enable - Whether to enable or disable indexing
 * @returns {Promise<void>}
 * @throws {MdutilError} If the operation fails or requires root privileges
 *
 * @example
 * ```typescript
 * // Enable indexing
 * await setIndexing('/', true)
 *
 * // Disable indexing
 * await setIndexing('/Volumes/Backup', false)
 * ```
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
 * Erase and rebuild the Spotlight index for a volume.
 * This operation may require root privileges and can take some time to complete.
 *
 * @param {string} volumePath - The path to the volume to rebuild
 * @returns {Promise<void>}
 * @throws {MdutilError} If the operation fails or requires root privileges
 *
 * @example
 * ```typescript
 * try {
 *   await eraseAndRebuildIndex('/')
 *   console.log('Index rebuilt successfully')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Root privileges required')
 *   }
 * }
 * ```
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
 * List the contents of the Spotlight index.
 * This operation typically requires root privileges.
 *
 * @param {string} volumePath - The path to the volume to inspect
 * @returns {Promise<string>} The index contents
 * @throws {MdutilError} If the operation fails or requires root privileges
 *
 * @example
 * ```typescript
 * try {
 *   const contents = await listIndexContents('/')
 *   console.log('Index contents:', contents)
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Root privileges required')
 *   }
 * }
 * ```
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
 * Flush local caches to network devices.
 * This operation may require root privileges.
 *
 * @param {string} volumePath - The path to the volume to flush
 * @returns {Promise<void>}
 * @throws {MdutilError} If the operation fails or requires root privileges
 *
 * @example
 * ```typescript
 * try {
 *   await flushCaches('/')
 *   console.log('Caches flushed successfully')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Root privileges required')
 *   }
 * }
 * ```
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
 * Remove the Spotlight index directory.
 * This operation typically requires root privileges.
 *
 * @param {string} volumePath - The path to the volume to modify
 * @returns {Promise<void>}
 * @throws {MdutilError} If the operation fails or requires root privileges
 *
 * @example
 * ```typescript
 * try {
 *   await removeIndex('/')
 *   console.log('Index removed successfully')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Root privileges required')
 *   }
 * }
 * ```
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
