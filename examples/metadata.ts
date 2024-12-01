import { getMetadata } from '../src/mdls.js'
import { getIndexingStatus, listIndexContents } from '../src/mdutil.js'

async function main() {
  try {
    // Example 1: Getting metadata for a file
    console.log('\n1. Getting metadata for a file:')
    try {
      const metadata = await getMetadata('package.json')
      console.log('Metadata:', metadata)
    } catch (error) {
      console.error('Failed to get metadata:', error)
    }

    // Example 2: Getting specific attributes
    console.log('\n2. Getting specific attributes:')
    try {
      const attributes = await getMetadata('package.json', {
        attributes: ['kMDItemContentType', 'kMDItemContentCreationDate']
      })
      console.log('Attributes:', attributes)
    } catch (error) {
      console.error('Failed to get attributes:', error)
    }

    // Example 3: Getting raw metadata output
    console.log('\n3. Getting raw metadata output:')
    try {
      const rawMetadata = await getMetadata('package.json', {
        raw: true,
        nullMarker: 'NULL'
      })
      console.log('Raw metadata:', rawMetadata)
    } catch (error) {
      console.error('Failed to get raw metadata:', error)
    }

    // Example 4: Checking Spotlight indexing status
    console.log('\n4. Checking Spotlight indexing status:')
    try {
      const status = await getIndexingStatus(process.cwd())
      console.log('Home directory indexing:')
      console.log('- Enabled:', status.enabled)
      console.log('- Last scan:', status.scanBaseTime?.toLocaleString())
      console.log('- Reasoning:', status.reasoning)
    } catch (error) {
      console.error('Failed to get indexing status:', error)
    }

    // Example 5: Listing Spotlight index contents
    console.log('\n5. Listing Spotlight index contents:')
    try {
      const contents = await listIndexContents(process.cwd())
      console.log('Index contents:', contents)
    } catch (error) {
      console.error('Failed to list index contents:', error)
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
