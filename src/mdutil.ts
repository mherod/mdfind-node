import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 * Error class for mdutil operations
 */
export class MdutilError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MdutilError'
  }
}

/**
 * Get indexing status for a directory
 */
export const getIndexingStatus = async (directory: string): Promise<string> => {
  try {
    const { stdout } = await execAsync(`mdutil -s "${directory}"`)
    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw new MdutilError(`Failed to get indexing status: ${error.message}`)
    }
    throw error
  }
}

/**
 * Enable or disable indexing for a directory
 */
export const setIndexing = async (directory: string, enable: boolean): Promise<void> => {
  try {
    const flag = enable ? 'on' : 'off'
    await execAsync(`mdutil -i ${flag} "${directory}"`)
  } catch (error) {
    if (error instanceof Error) {
      // Check for common error patterns
      if (
        error.message.includes('invalid operation') ||
        error.message.includes('Command failed: mdutil')
      ) {
        throw new MdutilError('Operation not permitted on this path')
      }
      if (error.message.includes('unknown indexing state')) {
        throw new MdutilError('Path is not eligible for Spotlight indexing')
      }
      throw new MdutilError(`Failed to ${enable ? 'enable' : 'disable'} indexing: ${error.message}`)
    }
    throw error
  }
}

/**
 * Erase and rebuild index for a directory
 */
export const eraseAndRebuildIndex = async (directory: string): Promise<void> => {
  try {
    await execAsync(`mdutil -E "${directory}"`)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('invalid operation')) {
        throw new MdutilError('Operation not permitted on this path')
      }
      throw new MdutilError(`Failed to erase and rebuild index: ${error.message}`)
    }
    throw error
  }
}

/**
 * Enable indexing for a directory
 */
export const enableIndexing = async (directory = '/'): Promise<void> => {
  await setIndexing(directory, true)
}

/**
 * Disable indexing for a directory
 */
export const disableIndexing = async (directory = '/'): Promise<void> => {
  await setIndexing(directory, false)
}

/**
 * Erase and rebuild index for a directory
 */
export const eraseIndex = async (directory = '/'): Promise<void> => {
  await eraseAndRebuildIndex(directory)
}
