import { getMetadata } from '../src/mdls.js'
import { getIndexingStatus, listIndexContents, MdutilError } from '../src/mdutil.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Get metadata for a file
    const filePath = join(homedir(), 'Downloads', 'example.pdf')
    console.log('\n1. Getting metadata for a file:')
    try {
      const metadata = await getMetadata(filePath)
      console.log('Metadata:', JSON.stringify(metadata, null, 2))
    } catch (error) {
      if (error instanceof Error) {
        console.log('No example.pdf found in Downloads:', error.message)
      }
    }

    // Get specific attributes
    console.log('\n2. Getting specific attributes:')
    try {
      const attributes = await getMetadata(filePath, {
        attributes: ['kMDItemContentType', 'kMDItemContentCreationDate']
      })
      console.log('Specific attributes:', attributes)
    } catch (error) {
      if (error instanceof Error) {
        console.log('No example.pdf found in Downloads:', error.message)
      }
    }

    // Get raw output
    console.log('\n3. Getting raw metadata output:')
    try {
      const rawData = await getMetadata(filePath, {
        raw: true,
        nullMarker: 'NULL'
      })
      console.log('Raw data:', rawData)
    } catch (error) {
      if (error instanceof Error) {
        console.log('No example.pdf found in Downloads:', error.message)
      }
    }

    // Check indexing status
    console.log('\n4. Checking Spotlight indexing status:')
    try {
      const homeStatus = await getIndexingStatus(homedir(), { verbose: true })
      console.log('Home directory indexing:')
      console.log('- Enabled:', homeStatus.enabled)
      console.log('- Last scan:', homeStatus.scanBaseTime?.toLocaleString())
      if (homeStatus.reasoning) {
        console.log('- Reasoning:', homeStatus.reasoning)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get indexing status:', error.message)
      }
    }

    // List index contents
    console.log('\n5. Listing Spotlight index contents:')
    try {
      const indexContents = await listIndexContents(homedir())
      console.log('Index contents:', indexContents)
    } catch (error) {
      if (error instanceof MdutilError && error.requiresRoot) {
        console.log('Note: This operation requires root privileges')
      } else if (error instanceof Error) {
        console.error('Failed to list index contents:', error.message)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  }
}

main()
