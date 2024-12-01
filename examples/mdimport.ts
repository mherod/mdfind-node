import {
  mdimport,
  listImporters,
  listAttributes,
  getSchema,
  reimportForImporter
} from '../src/mdimport.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: List installed importers
    console.log('\n1. Listing installed Spotlight importers:')
    const importers = await listImporters()
    console.log('Found', importers.length, 'importers:')
    importers.slice(0, 5).forEach(importer => {
      console.log('-', importer)
    })
    if (importers.length > 5) {
      console.log(`... and ${importers.length - 5} more`)
    }

    // Example 2: Test import a file
    console.log('\n2. Testing import of package.json:')
    const testResult = await mdimport('package.json', {
      test: true,
      debugLevel: '2',
      showPerformance: true
    })
    console.log('Import test result:', testResult)

    // Example 3: List available attributes
    console.log('\n3. Listing available Spotlight attributes:')
    const attributes = await listAttributes()
    console.log('Found', attributes.length, 'attributes:')
    attributes.slice(0, 5).forEach(attr => {
      console.log('-', attr)
    })
    if (attributes.length > 5) {
      console.log(`... and ${attributes.length - 5} more`)
    }

    // Example 4: Get schema information
    console.log('\n4. Getting Spotlight schema:')
    const schema = await getSchema()
    console.log('Schema excerpt (first 500 chars):')
    console.log(schema.slice(0, 500), '...')

    // Example 5: Import a directory
    console.log('\n5. Importing a directory:')
    const importResult = await mdimport(process.cwd(), {
      test: true, // Using test mode to avoid modifying index
      debugLevel: '1'
    })
    console.log('Directory import result:', importResult)

    // Example 6: Reimport files for a specific importer
    console.log('\n6. Reimporting files for Chat importer:')
    try {
      const chatImporter = '/System/Library/Spotlight/Chat.mdimporter'
      const reimportResult = await reimportForImporter(chatImporter)
      console.log('Reimport result:', reimportResult)
    } catch (error) {
      console.log('Failed to reimport Chat files:', error)
    }

    // Example 7: Import with output file
    console.log('\n7. Importing with output file:')
    const outputPath = join(homedir(), 'Desktop', 'mdimport-test.txt')
    const outputResult = await mdimport('package.json', {
      test: true,
      debugLevel: '3',
      outputFile: outputPath
    })
    console.log('Import with output file result:', outputResult)
    console.log('Results written to:', outputPath)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

void main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
