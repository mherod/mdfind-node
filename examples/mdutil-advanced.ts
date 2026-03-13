import {
  getVolumeConfiguration,
  listSpotlightStore,
  reimportFiles,
  removeSpotlightIndex,
  type MdutilError
} from 'mdfind-node'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const TEST_DIR = join(homedir(), 'Downloads')
const ROOT_DIR = '/'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
})

const confirm = async (message: string): Promise<boolean> => {
  return new Promise(resolve => {
    rl.question(`${message} (y/N) `, answer => {
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

async function main(): Promise<void> {
  try {
    // Example 1: Get detailed volume configuration
    console.error('\n1. Getting volume configuration for root volume:')
    const config = await getVolumeConfiguration(ROOT_DIR)
    console.error('Volume UUID:', config.uuid)
    console.error('Index Version:', config.indexVersion)
    console.error('Policy Level:', config.policyLevel)
    console.error('Exclusions:', config.exclusions)
    console.error('\nStores:')
    for (const [id, store] of Object.entries(config.stores)) {
      console.error(`  ${id}:`)
      console.error(`    Created: ${store.creationDate}`)
      console.error(`    Index Version: ${store.indexVersion}`)
      console.error(`    Path: ${store.partialPath}`)
      console.error(`    Policy: ${store.policyLevel}`)
    }

    // Example 2: List Spotlight store contents
    console.error('\n2. Listing Spotlight store contents for Downloads:')
    const entries = await listSpotlightStore(TEST_DIR)
    console.error(`Found ${entries.length} entries:`)
    for (const entry of entries.slice(0, 5)) {
      console.error(`  ${entry.type === 'directory' ? 'Dir' : 'File'}: ${entry.path}`)
      console.error(`    Permissions: ${entry.permissions}`)
      console.error(`    Size: ${entry.size} bytes`)
      console.error(`    Modified: ${entry.modificationDate}`)
    }
    if (entries.length > 5) {
      console.error(`  ... and ${entries.length - 5} more entries`)
    }

    // Example 3: Reimport files for a specific plugin (with confirmation)
    console.error('\n3. Plugin reimport capability:')
    const pluginId = 'com.apple.spotlight.ImporterAgent'
    if (await confirm(`Do you want to reimport files for plugin ${pluginId} in Downloads?`)) {
      const reimportResult = await reimportFiles(pluginId, TEST_DIR)
      console.error('Plugin:', reimportResult.pluginId)
      console.error('Files Processed:', reimportResult.filesProcessed)
      console.error('Success:', reimportResult.success)
    } else {
      console.error('Skipping plugin reimport')
    }

    // Example 4: Remove and rebuild index (with confirmation)
    console.error('\n4. Index removal capability:')
    if (
      await confirm(
        `Do you want to remove the Spotlight index for Downloads? This will require a reindex.`
      )
    ) {
      const removeResult = await removeSpotlightIndex(TEST_DIR)
      console.error('Success:', removeResult.success)
      console.error('Requires Reindex:', removeResult.requiresReindex)
      console.error('Message:', removeResult.message)
    } else {
      console.error('Skipping index removal')
    }
  } catch (error) {
    if (error instanceof Error && (error as MdutilError).requiresRoot) {
      console.error('\nThis example requires root privileges. Please run with sudo.')
    } else {
      console.error('Error:', error)
    }
    process.exit(1)
  } finally {
    rl.close()
  }
}

void main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
