import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import {
  type IndexingState,
  type IndexStatus,
  IndexStatusSchema,
  type MdutilOptions,
  MdutilOptionsSchema
} from './schemas/index.js'

const execAsync = promisify(exec)

/**
 * Custom error class for mdutil-related errors.
 *
 * Properties:
 * - message: Error description
 * - stderr: Raw error output from the command
 * - requiresRoot: Whether the operation needs root access
 */
export class MdutilError extends Error {
  public readonly name = 'MdutilError' as const

  constructor(
    message: string,
    public readonly stderr: string,
    public readonly requiresRoot: boolean = false
  ) {
    super(message)
  }
}

/**
 * Parse the raw output from mdutil -s command
 */
const parseIndexingStatus = (output: string, volumePath: string): IndexStatus => {
  // Normalize the volume path
  const resolvedPath = resolve(volumePath)
  const isSystemVolume = resolvedPath.startsWith('/System/Volumes/')

  // Determine the indexing state
  let state: IndexingState
  if (output.includes('Indexing enabled')) {
    state = 'enabled'
  } else if (output.includes('Indexing disabled')) {
    state = 'disabled'
  } else if (output.includes('Error: unknown indexing state')) {
    state = 'unknown'
  } else {
    state = 'error'
  }

  // Extract scan base time if present
  const scanBaseMatch = output.match(/Scan base time: ([^(]+)/)
  let scanBaseTime: Date | null = null
  if (scanBaseMatch?.[1]) {
    try {
      scanBaseTime = new Date(scanBaseMatch[1])
    } catch {
      // Invalid date format, leave as null
    }
  }

  // Extract reasoning if present
  const reasoningMatch = output.match(/reasoning: '([^']*)'/)
  const reasoning = reasoningMatch?.[1] ?? null

  const result = {
    state,
    enabled: state === 'enabled',
    status: output.trim(),
    scanBaseTime,
    reasoning,
    volumePath: resolvedPath,
    isSystemVolume
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
 *   - resolveRealPath: Resolve symlinks to real paths (default: true)
 *   - excludeSystemVolumes: Filter out system volumes (default: false)
 *   - excludeUnknownState: Filter out volumes with unknown state (default: false)
 *
 * @returns {Promise<IndexStatus>} Current indexing status
 *
 * @throws {MdutilError}
 *   - If the path doesn't exist
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const getIndexingStatus = async (
  volumePath: string,
  options: MdutilOptions = {
    verbose: false,
    resolveRealPath: true,
    excludeSystemVolumes: false,
    excludeUnknownState: false
  }
): Promise<IndexStatus> => {
  const validatedOptions = MdutilOptionsSchema.parse(options)
  const args = ['-s']
  if (validatedOptions.verbose) args.push('-v')
  args.push(volumePath)

  try {
    const { stdout } = await execAsync(`mdutil ${args.map(arg => `"${arg}"`).join(' ')}`)
    return parseIndexingStatus(stdout, volumePath)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(
        `Failed to get indexing status: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Get indexing status for all volumes.
 * Returns an array of status objects for each volume.
 *
 * @param {MdutilOptions} [options] - Configuration options:
 *   - verbose: Include additional status details
 *   - resolveRealPath: Resolve symlinks to real paths (default: true)
 *   - excludeSystemVolumes: Filter out system volumes (default: false)
 *   - excludeUnknownState: Filter out volumes with unknown state (default: false)
 *
 * @returns {Promise<IndexStatus[]>} Array of volume statuses
 */
export const getAllVolumesStatus = async (
  options: MdutilOptions = {
    verbose: false,
    resolveRealPath: true,
    excludeSystemVolumes: false,
    excludeUnknownState: false
  }
): Promise<IndexStatus[]> => {
  const validatedOptions = MdutilOptionsSchema.parse(options)
  const args = ['-s', '-a']
  if (validatedOptions.verbose) args.push('-v')

  try {
    const { stdout } = await execAsync(`mdutil ${args.join(' ')}`)
    const volumes = stdout.split('\n\n').filter(Boolean)
    const results = volumes.map(volume => {
      const pathMatch = volume.match(/^([^:]+):/)
      const volumePath = pathMatch?.[1] ?? '/'
      return parseIndexingStatus(volume, volumePath)
    })

    return results.filter(result => {
      if (validatedOptions.excludeSystemVolumes && result.isSystemVolume) return false
      if (validatedOptions.excludeUnknownState && result.state === 'unknown') return false
      return true
    })
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(
        `Failed to get all volumes status: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Enable or disable Spotlight indexing for a volume or directory.
 *
 * Note: This operation often requires root privileges.
 *
 * @param {string} volumePath - Path to enable/disable indexing for
 * @param {boolean} enable - Whether to enable (true) or disable (false) indexing
 * @returns {Promise<void>}
 */
export const setIndexing = async (volumePath: string, enable: boolean): Promise<void> => {
  try {
    await execAsync(`mdutil -i ${enable ? 'on' : 'off'} "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(
        `Failed to ${enable ? 'enable' : 'disable'} indexing: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Erase and rebuild the Spotlight index.
 *
 * Note: This operation often requires root privileges.
 *
 * @param {string} volumePath - Path to rebuild index for
 * @returns {Promise<void>}
 */
export const eraseAndRebuildIndex = async (volumePath: string): Promise<void> => {
  try {
    await execAsync(`mdutil -E "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(
        `Failed to erase and rebuild index: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * List the contents of the Spotlight index.
 * Shows what files and directories are currently indexed.
 *
 * Note: This operation requires root privileges.
 *
 * @param {string} volumePath - Path to list index contents for
 * @returns {Promise<string>} Index contents listing
 */
export const listIndexContents = async (volumePath: string): Promise<string> => {
  try {
    const { stdout } = await execAsync(`mdutil -L "${volumePath}"`)
    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(
        `Failed to list index contents: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Get the Spotlight configuration for a volume.
 * Returns the contents of VolumeConfig.plist.
 *
 * Note: This operation requires root privileges.
 *
 * @param {string} volumePath - Path to get configuration for
 * @returns {Promise<string>} Volume configuration
 */
export const getVolumeConfig = async (volumePath: string): Promise<string> => {
  try {
    const { stdout } = await execAsync(`mdutil -P "${volumePath}"`)
    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(
        `Failed to get volume config: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Remove the Spotlight index directory for a volume.
 * Does not disable indexing, but forces Spotlight to reevaluate the volume.
 *
 * Note: This operation requires root privileges.
 *
 * @param {string} volumePath - Path to remove index for
 * @returns {Promise<void>}
 */
export const removeIndexDirectory = async (volumePath: string): Promise<void> => {
  try {
    await execAsync(`mdutil -X "${volumePath}"`)
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdutilError(
        `Failed to remove index directory: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}
