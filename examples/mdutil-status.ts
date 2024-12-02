/* eslint-disable no-console */
import { getAllVolumesStatus, getIndexingStatus } from 'mdfind-node'
import { homedir } from 'os'

async function main(): Promise<void> {
  try {
    // Example 1: Get status for home directory
    console.log('\n1. Indexing status for home directory:')
    const homeStatus = await getIndexingStatus(homedir(), {
      maxBuffer: 1024 * 512,
      literal: false,
      interpret: false,
      verbose: true,
      excludeSystemVolumes: true,
      excludeUnknownState: false
    })
    console.log('Status:', homeStatus)

    // Example 2: Get status for all volumes
    console.log('\n2. Status for all volumes:')
    const allVolumes = await getAllVolumesStatus({
      maxBuffer: 1024 * 512,
      literal: false,
      interpret: false,
      verbose: true,
      excludeSystemVolumes: true,
      excludeUnknownState: false
    })
    console.log('All volumes status:', allVolumes)

    // Example 3: Get status with all options
    console.log('\n3. Status with all options:')
    const detailedStatus = await getIndexingStatus(homedir(), {
      maxBuffer: 1024 * 512,
      literal: true,
      interpret: true,
      verbose: true,
      excludeSystemVolumes: true,
      excludeUnknownState: true
    })
    console.log('Detailed status:', detailedStatus)
  } catch (error) {
    console.error('Error:', error)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
