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
 * Custom error class for mdutil-related errors.
 * Provides additional context about root privileges requirement.
 *
 * Properties:
 * - message: Error description
 * - requiresRoot: Whether the operation needs root access
 *
 * @example
 * ```typescript
 * try {
 *   await listIndexContents('/')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('This operation requires sudo')
 *   }
 * }
 * ```
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
 * Get Spotlight indexing status for a volume or directory.
 * Checks if indexing is enabled and provides current status.
 *
 * @param {string} volumePath - Path to check indexing status for
 * @param {MdutilOptions} [options] - Configuration options:
 *   - verbose: Include additional status details
 *
 * @returns {Promise<IndexStatus>} Current indexing status:
 *   - enabled: Whether indexing is enabled
 *   - status: Current status message
 *   - scanBaseTime: Last completed scan time
 *   - reasoning: Explanation for current status
 *
 * @throws {MdutilError}
 *   - If the path doesn't exist
 *   - If mdutil command fails
 *   - If root privileges are required
 *
 * @example
 * Check home directory status:
 * ```typescript
 * const status = await getIndexingStatus('~')
 * console.log('Indexing enabled:', status.enabled)
 * console.log('Last scan:', status.scanBaseTime)
 * ```
 *
 * @example
 * Check with verbose output:
 * ```typescript
 * const status = await getIndexingStatus('/Volumes/Data', {
 *   verbose: true
 * })
 * console.log('Status:', status.status)
 * console.log('Reason:', status.reasoning)
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
 * Enable or disable Spotlight indexing for a volume or directory.
 * Controls whether files in the specified location are indexed.
 *
 * Note: This operation often requires root privileges.
 *
 * @param {string} volumePath - Path to enable/disable indexing for
 * @param {boolean} enable - Whether to enable (true) or disable (false) indexing
 * @returns {Promise<void>}
 *
 * @throws {MdutilError}
 *   - If root privileges are required
 *   - If mdutil command fails
 *   - If the path doesn't exist
 *
 * @example
 * Enable indexing:
 * ```typescript
 * try {
 *   await setIndexing('~/Documents', true)
 *   console.log('Indexing enabled')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Please run with sudo')
 *   }
 * }
 * ```
 *
 * @example
 * Disable indexing:
 * ```typescript
 * await setIndexing('/Volumes/Backup', false)
 * console.log('Indexing disabled')
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
 * Erase and rebuild the Spotlight index.
 * Useful when the index becomes corrupted or needs refreshing.
 *
 * Note: This operation often requires root privileges.
 *
 * @param {string} volumePath - Path to rebuild index for
 * @returns {Promise<void>}
 *
 * @throws {MdutilError}
 *   - If root privileges are required
 *   - If mdutil command fails
 *   - If the path doesn't exist
 *
 * @example
 * Rebuild index:
 * ```typescript
 * try {
 *   await eraseAndRebuildIndex('/')
 *   console.log('Index rebuild started')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Please run with sudo')
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
 * Shows what files and directories are currently indexed.
 *
 * Note: This operation often requires root privileges.
 *
 * @param {string} volumePath - Path to list index contents for
 * @returns {Promise<string>} Index contents listing
 *
 * @throws {MdutilError}
 *   - If root privileges are required
 *   - If mdutil command fails
 *   - If the path doesn't exist
 *
 * @example
 * List indexed files:
 * ```typescript
 * try {
 *   const contents = await listIndexContents('~')
 *   console.log('Indexed files:', contents)
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Please run with sudo')
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
 * Ensures all metadata changes are synchronized.
 *
 * Note: This operation often requires root privileges.
 *
 * @param {string} volumePath - Path to flush caches for
 * @returns {Promise<void>}
 *
 * @throws {MdutilError}
 *   - If root privileges are required
 *   - If mdutil command fails
 *   - If the path doesn't exist
 *
 * @example
 * ```typescript
 * try {
 *   await flushCaches('/')
 *   console.log('Caches flushed successfully')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Please run with sudo')
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
 * Completely removes the index without rebuilding.
 *
 * Note: This operation often requires root privileges.
 * Use with caution as it will require a full reindex.
 *
 * @param {string} volumePath - Path to remove index for
 * @returns {Promise<void>}
 *
 * @throws {MdutilError}
 *   - If root privileges are required
 *   - If mdutil command fails
 *   - If the path doesn't exist
 *
 * @example
 * ```typescript
 * try {
 *   await removeIndex('/')
 *   console.log('Index removed successfully')
 * } catch (error) {
 *   if (error instanceof MdutilError && error.requiresRoot) {
 *     console.log('Please run with sudo')
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
