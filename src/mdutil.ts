import { exec } from 'node:child_process'
import { resolve } from 'node:path'
import { promisify } from 'node:util'
import { mdfind } from './index.js'
import {
  type IndexingState,
  type IndexStatus,
  IndexStatusSchema,
  type MdutilOptions,
  MdutilOptionsSchema
} from './schemas/index.js'

const execAsync = promisify(exec)

/**
 * Safely escape a path for shell execution
 * @internal
 */
function escapeShellPath(path: string): string {
  return path
    .replace(/([\s'"\[\](){}$&*?|<>^;`\\])/g, '\\$1') // Escape shell special characters
    .replace(/\n/g, '') // Remove newlines
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\t/g, '') // Remove tabs
    .replace(/\0/g, '') // Remove null bytes
    .trim() // Remove leading/trailing whitespace
}

/**
 * Custom error class for mdutil-related errors.
 * Provides additional context about the error and whether root access is required.
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
 * Parse the raw output from mdutil -s command.
 * Extracts indexing state, scan time, and other metadata.
 *
 * @internal
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
    maxBuffer: 1024 * 1024,
    literal: false,
    interpret: true,
    verbose: false,
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
 *
 * @throws {MdutilError}
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const getAllVolumesStatus = async (
  options: MdutilOptions = {
    maxBuffer: 1024 * 1024,
    literal: false,
    interpret: true,
    verbose: false,
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
 * Check for any existing Spotlight entries in a directory.
 * This helps verify if a path is truly removed from the index.
 *
 * @param {string} volumePath - Path to check for entries
 * @returns {Promise<string[]>} Array of indexed file paths
 *
 * @throws {MdutilError}
 *   - If the path doesn't exist
 *   - If the search fails
 */
export const getIndexedEntries = async (volumePath: string): Promise<string[]> => {
  try {
    const resolvedPath = resolve(volumePath)
    // Search for both the directory itself and any files within it
    const query = `kMDItemPath == "${resolvedPath}"* || kMDItemPath == "${resolvedPath}"`
    return await mdfind(query)
  } catch (error) {
    if (error instanceof Error) {
      throw new MdutilError(
        `Failed to check indexed entries: ${error.message}`,
        error.message,
        false
      )
    }
    throw error
  }
}

/**
 * Enable or disable Spotlight indexing for a volume or directory.
 * Also verifies the change and checks for any remaining indexed entries.
 *
 * @param {string} volumePath - Path to enable/disable indexing for
 * @param {boolean} enable - Whether to enable (true) or disable (false) indexing
 * @returns {Promise<{ success: boolean; remainingEntries: string[] }>} Status and any remaining entries
 *
 * @throws {MdutilError}
 *   - If the path doesn't exist
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const setIndexing = async (
  volumePath: string,
  enable: boolean
): Promise<{ success: boolean; remainingEntries: string[] }> => {
  try {
    const resolvedPath = resolve(volumePath)
    await execAsync(`mdutil -i ${enable ? 'on' : 'off'} "${escapeShellPath(resolvedPath)}"`)

    // Check if the operation was successful by verifying the current status
    const status = await getIndexingStatus(resolvedPath)
    const success = status.enabled === enable

    // If disabling, check for remaining entries
    const remainingEntries = enable ? [] : await getIndexedEntries(resolvedPath)

    return {
      success,
      remainingEntries
    }
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      const isInvalidOp = error.message.includes('invalid operation')
      const isUnknownState = error.message.includes('unknown indexing state')

      if (isInvalidOp) {
        throw new MdutilError('Operation not permitted on this path', error.message, requiresRoot)
      } else if (isUnknownState) {
        throw new MdutilError('Path is not eligible for Spotlight indexing', error.message, false)
      }

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
 *
 * @throws {MdutilError}
 *   - If the path doesn't exist
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const eraseAndRebuildIndex = async (volumePath: string): Promise<void> => {
  try {
    const resolvedPath = resolve(volumePath)
    const escapedPath = escapeShellPath(resolvedPath)
    await execAsync(`mdutil -E "${escapedPath}"`)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('invalid operation')) {
        throw new MdutilError('Operation not permitted on this path', error.message, false)
      }
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
 *
 * @throws {MdutilError}
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const listIndexContents = async (volumePath: string): Promise<string> => {
  try {
    const resolvedPath = resolve(volumePath)
    const escapedPath = escapeShellPath(resolvedPath)
    const { stdout } = await execAsync(`mdutil -L "${escapedPath}"`)
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
 *
 * @throws {MdutilError}
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const getVolumeConfig = async (volumePath: string): Promise<string> => {
  try {
    const resolvedPath = resolve(volumePath)
    const escapedPath = escapeShellPath(resolvedPath)
    const { stdout } = await execAsync(`mdutil -P "${escapedPath}"`)
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
 *
 * @throws {MdutilError}
 *   - If mdutil command fails
 *   - If root privileges are required
 */
export const removeIndexDirectory = async (volumePath: string): Promise<void> => {
  try {
    const resolvedPath = resolve(volumePath)
    const escapedPath = escapeShellPath(resolvedPath)
    await execAsync(`mdutil -X "${escapedPath}"`)
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

// Convenience methods with default root path
export const enableIndexing = async (directory = '/'): Promise<void> => {
  await setIndexing(directory, true)
}

export const disableIndexing = async (directory = '/'): Promise<void> => {
  await setIndexing(directory, false)
}

export const eraseIndex = (directory = '/'): Promise<void> => eraseAndRebuildIndex(directory)

/**
 * Interface for volume configuration details
 */
export interface VolumeConfig {
  uuid: string
  creationDate: Date
  modificationDate: Date
  indexVersion: number
  policyLevel: string
  exclusions: string[]
  stores: Record<
    string,
    {
      creationDate: Date
      indexVersion: number
      partialPath: string
      policyLevel: string
    }
  >
}

/**
 * Interface for Spotlight store entries
 */
export interface StoreEntry {
  path: string
  type: 'directory' | 'file'
  permissions: string
  size: number
  modificationDate: Date
}

/**
 * Interface for index removal results
 */
export interface RemoveIndexResult {
  success: boolean
  requiresReindex: boolean
  message: string
}

/**
 * Interface for file reimport results
 */
export interface ReimportResult {
  pluginId: string
  filesProcessed: number
  success: boolean
}

/**
 * Get detailed configuration for a volume's Spotlight index
 */
export const getVolumeConfiguration = async (volumePath: string): Promise<VolumeConfig> => {
  try {
    const { stdout } = await execAsync(`sudo mdutil -P "${escapeShellPath(volumePath)}" | cat`)
    const plist = stdout.trim()

    // Parse the plist XML
    const configMatch = plist.match(/<dict>[\s\S]*<\/dict>/)
    if (!configMatch) {
      throw new Error('Invalid configuration format')
    }

    // Extract key values using regex with better patterns
    const uuid =
      plist.match(/<key>ConfigurationVolumeUUID<\/key>\s*<string>([^<]+)<\/string>/)?.[1] ?? ''
    const creationDate = new Date(
      plist.match(/<key>ConfigurationCreationDate<\/key>\s*<date>([^<]+)<\/date>/)?.[1] ?? ''
    )
    const modificationDate = new Date(
      plist.match(/<key>ConfigurationModificationDate<\/key>\s*<date>([^<]+)<\/date>/)?.[1] ?? ''
    )

    // Extract stores information with improved patterns
    const stores: VolumeConfig['stores'] = {}
    const storeMatches = plist.matchAll(/<key>([A-F0-9-]+)<\/key>\s*<dict>([\s\S]*?)<\/dict>/g)
    for (const match of storeMatches) {
      const [, storeId, storeData] = match
      if (storeId && storeData) {
        const creationDateMatch = storeData.match(
          /<key>CreationDate<\/key>\s*<date>([^<]+)<\/date>/
        )
        const indexVersionMatch = storeData.match(
          /<key>IndexVersion<\/key>\s*<integer>(\d+)<\/integer>/
        )
        const partialPathMatch = storeData.match(
          /<key>PartialPath<\/key>\s*<string>([^<]+)<\/string>/
        )
        const policyLevelMatch = storeData.match(
          /<key>PolicyLevel<\/key>\s*<string>([^<]+)<\/string>/
        )

        stores[storeId] = {
          creationDate: new Date(creationDateMatch?.[1] ?? ''),
          indexVersion: parseInt(indexVersionMatch?.[1] ?? '0', 10),
          partialPath: partialPathMatch?.[1] ?? '',
          policyLevel: policyLevelMatch?.[1] ?? ''
        }
      }
    }

    // Extract exclusions with better pattern
    const exclusions: string[] = []
    const exclusionsMatch = plist.match(/<key>Exclusions<\/key>\s*<array>([\s\S]*?)<\/array>/)
    if (exclusionsMatch?.[1]) {
      const exclusionMatches = exclusionsMatch[1].matchAll(/<string>([^<]+)<\/string>/g)
      for (const match of exclusionMatches) {
        if (match[1]) exclusions.push(match[1])
      }
    }

    // Get index version from first store or default to 0
    const indexVersion = Object.values(stores)[0]?.indexVersion ?? 0
    const policyLevel = Object.values(stores)[0]?.policyLevel ?? 'unknown'

    return {
      uuid,
      creationDate,
      modificationDate,
      indexVersion,
      policyLevel,
      exclusions,
      stores
    }
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(
        `Failed to get volume configuration: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * List contents of the Spotlight store directory
 */
export const listSpotlightStore = async (volumePath: string): Promise<StoreEntry[]> => {
  try {
    const { stdout } = await execAsync(`sudo mdutil -L "${escapeShellPath(volumePath)}" | cat`)
    const entries: StoreEntry[] = []

    // Parse the ls-style output
    const lines = stdout.split('\n').filter(Boolean)
    for (const line of lines) {
      const match = line.match(
        /^([drwx-]{10})\s+\d+\s+\d+\s+\d+\s+(\d+)\s+(\w+\s+\d+\s+[\d:]+)\s+(.+)$/
      )
      if (match) {
        const [, permStr, sizeStr, dateStr, pathStr] = match
        if (permStr && sizeStr && dateStr && pathStr) {
          entries.push({
            path: pathStr,
            type: permStr.startsWith('d') ? 'directory' : 'file',
            permissions: permStr,
            size: parseInt(sizeStr, 10),
            modificationDate: new Date(dateStr)
          })
        }
      }
    }

    return entries
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(
        `Failed to list Spotlight store: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Remove the Spotlight index directory for a volume
 * This does not disable indexing, but forces Spotlight to rebuild the index
 * Requires root privileges
 *
 * @param {string} volumePath - Path to the volume
 * @returns {Promise<RemoveIndexResult>} Result of the operation
 * @throws {MdutilError} If operation fails or requires root
 */
export const removeSpotlightIndex = async (volumePath: string): Promise<RemoveIndexResult> => {
  try {
    const { stdout } = await execAsync(`sudo mdutil -X "${escapeShellPath(volumePath)}" | cat`)

    const success = !stdout.includes('Error')
    const requiresReindex = success // If successful, reindex is always required
    const message = stdout.trim() || 'Index directory removed successfully'

    return {
      success,
      requiresReindex,
      message
    }
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(
        `Failed to remove Spotlight index: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * Request reimport of files for a specific Spotlight plugin
 * Useful when plugin updates require reprocessing of certain file types
 * Requires root privileges
 *
 * @param {string} pluginId - ID of the Spotlight importer plugin
 * @param {string} volumePath - Path to the volume
 * @returns {Promise<ReimportResult>} Result of the reimport operation
 * @throws {MdutilError} If operation fails or requires root
 */
export const reimportFiles = async (
  pluginId: string,
  volumePath: string
): Promise<ReimportResult> => {
  try {
    const { stdout } = await execAsync(
      `sudo mdutil -r "${escapeShellPath(pluginId)}" "${escapeShellPath(volumePath)}" | cat`
    )

    // Parse the output to determine success and count
    const filesProcessed = parseInt(stdout.match(/Processed (\d+) files/)?.[1] ?? '0', 10)
    const success = !stdout.includes('Error') && filesProcessed > 0

    return {
      pluginId,
      filesProcessed,
      success
    }
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Must be root')
      throw new MdutilError(
        `Failed to reimport files: ${error.message}`,
        error.message,
        requiresRoot
      )
    }
    throw error
  }
}
