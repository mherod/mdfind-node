/* eslint-disable no-console */
import { getIndexedEntries, getIndexingStatus, type MdutilError, setIndexing } from 'mdfind-node'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const ICLOUD_DRIVE_BASE = '~/Library/Mobile Documents'

function findHiddenDirectories(basePath: string): string[] {
  const paths: string[] = []
  const absoluteBasePath = resolve(basePath.replace(/^~/, homedir()))

  if (!existsSync(absoluteBasePath)) {
    console.warn(`iCloud Drive path does not exist: ${absoluteBasePath}`)
    return paths
  }

  try {
    const entries = readdirSync(absoluteBasePath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const fullPath = join(absoluteBasePath, entry.name)
      // Check if this is an iCloud app directory
      if (entry.name.startsWith('iCloud~')) {
        // Look for Documents/Hidden in this app directory
        const documentsPath = join(fullPath, 'Documents')
        if (existsSync(documentsPath)) {
          const hiddenPath = join(documentsPath, 'Hidden')
          if (existsSync(hiddenPath)) {
            paths.push(hiddenPath)
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to scan directory ${absoluteBasePath}: ${(error as Error).message}`)
  }

  return paths
}

async function removeFromSpotlight(path: string): Promise<void> {
  try {
    // Resolve and validate the path
    const absolutePath = resolve(path)
    if (!existsSync(absolutePath)) {
      console.error(`Path does not exist: ${absolutePath}`)
      return
    }

    console.log(`\nProcessing: ${absolutePath}`)

    // First check if the path exists and its current status
    const status = await getIndexingStatus(absolutePath)
    if (!status.enabled) {
      console.log(`Indexing is already disabled for: ${absolutePath}`)
    } else {
      // Disable indexing
      console.log('Disabling Spotlight indexing...')
      const result = await setIndexing(absolutePath, false)
      if (result.success) {
        console.log(`Successfully disabled Spotlight indexing for: ${absolutePath}`)
      } else {
        console.warn('Warning: Failed to verify indexing was disabled')
      }
    }

    // Check for any existing entries
    console.log('Checking for existing Spotlight entries...')
    const remainingEntries = await getIndexedEntries(absolutePath)
    if (remainingEntries.length > 0) {
      console.warn(`Found ${remainingEntries.length} existing Spotlight entries:`)
      for (const entry of remainingEntries) {
        console.warn(`  ${entry}`)
      }
      console.warn(
        'You may want to wait for Spotlight to reindex or force a reindex to clear these entries'
      )
    } else {
      console.log('No existing Spotlight entries found')
    }
  } catch (error) {
    if (error instanceof Error && (error as MdutilError).requiresRoot) {
      console.error('This operation requires root privileges. Please run with sudo.')
    } else {
      console.error('Failed to disable indexing:', (error as Error).message)
    }
  }
}

async function main(): Promise<void> {
  console.log('Discovering Hidden directories in iCloud Drive...')
  const hiddenDirs = findHiddenDirectories(ICLOUD_DRIVE_BASE)

  if (hiddenDirs.length === 0) {
    console.warn('No Hidden directories found in iCloud Drive')
    return
  }

  console.log(
    `Found ${hiddenDirs.length} Hidden ${hiddenDirs.length === 1 ? 'directory' : 'directories'}:`
  )
  for (const dir of hiddenDirs) {
    console.log(`  ${dir}`)
  }

  // Process each directory
  for (const dir of hiddenDirs) {
    await removeFromSpotlight(dir)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
