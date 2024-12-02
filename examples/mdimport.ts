/* eslint-disable no-console */
import {
  getSchema,
  listAttributes,
  listImporters,
  mdimport,
  MdimportError,
  reimportForImporter
} from 'mdfind-node'
import { homedir } from 'os'
import { join } from 'path'

async function main(): Promise<void> {
  try {
    // Example 1: List available importers
    console.log('\n1. Available importers:')
    const importers = await listImporters()
    console.log('First 5 importers:')
    importers.slice(0, 5).forEach(importer => {
      console.log(`- ${importer}`)
    })

    // Example 2: Import a single file
    console.log('\n2. Importing a single file:')
    const testResult = await mdimport('package.json', {
      test: true,
      debugLevel: '2'
    })
    console.log('Import result:', testResult)

    // Example 3: List available attributes
    console.log('\n3. Available attributes:')
    const attributes = await listAttributes()
    console.log('First 5 attributes:')
    attributes.slice(0, 5).forEach(attr => {
      console.log(`- ${attr}`)
    })

    // Example 4: Get schema information
    console.log('\n4. Schema information:')
    const schema = await getSchema()
    console.log('Schema:', schema)

    // Example 5: Import files with specific importer
    console.log('\n5. Import files with specific importer:')
    const chatImporter = 'System/Library/Spotlight/Chat.mdimporter'
    try {
      const reimportResult = await reimportForImporter(chatImporter)
      console.log('Reimport result:', reimportResult)
    } catch (error) {
      if (error instanceof MdimportError) {
        console.log('Import error:', error.message)
      } else {
        throw error
      }
    }

    // Example 6: Import with output options
    console.log('\n6. Import with output options:')
    const outputResult = await mdimport('package.json', {
      test: true,
      debugLevel: '3',
      outputFile: 'mdimport-output.txt'
    })
    console.log('Output result:', outputResult)

    // Example 7: Import multiple files
    console.log('\n7. Import multiple files:')
    const files = ['package.json', 'tsconfig.json']
    const multipleResult = await Promise.all(files.map(file => mdimport(file, { test: true })))
    console.log('Multiple import result:', multipleResult)

    // Example 8: Import files recursively
    console.log('\n8. Import files recursively:')
    const testFilePath = join(homedir(), 'Documents')
    try {
      const recursiveResult = await mdimport(testFilePath, {
        test: true,
        recursive: true
      })
      console.log('Recursive import result:', recursiveResult)
    } catch (error) {
      if (error instanceof MdimportError) {
        console.log('Import error:', error.message)
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
