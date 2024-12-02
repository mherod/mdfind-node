import { exec } from 'node:child_process'
import { unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

export const execAsync = promisify(exec)

export const SPOTLIGHT_INDEX_TIMEOUT = 5000 // 5 seconds

export interface TestFileConfig {
  name: string
  content: string
  directory?: string
}

/**
 * Create a test file and wait for Spotlight to index it
 */
export async function createTestFile(config: TestFileConfig): Promise<string> {
  const directory = config.directory ?? join(process.cwd(), 'test', 'fixtures')
  const filePath = join(directory, config.name)

  // Create test file
  await writeFile(filePath, config.content, 'utf-8')

  // Force immediate indexing
  await execAsync(`mdimport -i "${filePath}"`)

  // Give Spotlight time to index
  await new Promise(resolve => {
    setTimeout(resolve, SPOTLIGHT_INDEX_TIMEOUT)
  })

  return filePath
}

/**
 * Clean up a test file
 */
export async function removeTestFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath)
  } catch (error) {
    console.error('Failed to clean up test file:', error)
  }
}

/**
 * Check if Spotlight has finished indexing a file
 */
export async function isSpotlightReady(filePath: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`mdls "${filePath}"`)
    return !stdout.includes('kMDItemFSName = (null)')
  } catch {
    return false
  }
}
