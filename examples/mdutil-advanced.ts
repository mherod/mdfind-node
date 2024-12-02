/* eslint-disable no-console */
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
    console.log('\n1. Getting volume configuration for root volume:')
    const config = await getVolumeConfiguration(ROOT_DIR)
    console.log('Volume UUID:', config.uuid)
    console.log('Index Version:', config.indexVersion)
    console.log('Policy Level:', config.policyLevel)
    console.log('Exclusions:', config.exclusions)
    console.log('\nStores:')
    for (const [id, store] of Object.entries(config.stores)) {
      console.log(`  ${id}:`)
      console.log(`    Created: ${store.creationDate}`)
      console.log(`    Index Version: ${store.indexVersion}`)
      console.log(`    Path: ${store.partialPath}`)
      console.log(`    Policy: ${store.policyLevel}`)
    }

    // Example 2: List Spotlight store contents
    console.log('\n2. Listing Spotlight store contents for Downloads:')
    const entries = await listSpotlightStore(TEST_DIR)
    console.log(`Found ${entries.length} entries:`)
    for (const entry of entries.slice(0, 5)) {
      console.log(`  ${entry.type === 'directory' ? 'Dir' : 'File'}: ${entry.path}`)
      console.log(`    Permissions: ${entry.permissions}`)
      console.log(`    Size: ${entry.size} bytes`)
      console.log(`    Modified: ${entry.modificationDate}`)
    }
    if (entries.length > 5) {
      console.log(`  ... and ${entries.length - 5} more entries`)
    }

    // Example 3: Reimport files for a specific plugin (with confirmation)
    console.log('\n3. Plugin reimport capability:')
    const pluginId = 'com.apple.spotlight.ImporterAgent'
    if (await confirm(`Do you want to reimport files for plugin ${pluginId} in Downloads?`)) {
      const reimportResult = await reimportFiles(pluginId, TEST_DIR)
      console.log('Plugin:', reimportResult.pluginId)
      console.log('Files Processed:', reimportResult.filesProcessed)
      console.log('Success:', reimportResult.success)
    } else {
      console.log('Skipping plugin reimport')
    }

    // Example 4: Remove and rebuild index (with confirmation)
    console.log('\n4. Index removal capability:')
    if (
      await confirm(
        `Do you want to remove the Spotlight index for Downloads? This will require a reindex.`
      )
    ) {
      const removeResult = await removeSpotlightIndex(TEST_DIR)
      console.log('Success:', removeResult.success)
      console.log('Requires Reindex:', removeResult.requiresReindex)
      console.log('Message:', removeResult.message)
    } else {
      console.log('Skipping index removal')
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
