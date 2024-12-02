/* eslint-disable no-console */
import {
  batchSearch,
  batchSearchSequential,
  mdfindMultiDirectory,
  mdfindMultiQuery
} from 'mdfind-node'
import { homedir } from 'os'
import { join } from 'path'

async function main(): Promise<void> {
  try {
    const downloadsDir = join(homedir(), 'Downloads')
    const documentsDir = join(homedir(), 'Documents')
    const desktopDir = join(homedir(), 'Desktop')

    // Example 1: Batch search with multiple queries and directories
    console.log('\n1. Batch search with multiple queries and directories:')
    const searches = [
      {
        query: 'kind:image date:today',
        options: { onlyInDirectory: downloadsDir }
      },
      {
        query: 'kind:document date:thisweek',
        options: { onlyInDirectory: documentsDir }
      },
      {
        query: 'kind:application',
        options: { onlyInDirectory: desktopDir }
      }
    ]

    const batchResults = await batchSearch(searches)

    // Process and display results
    for (let i = 0; i < searches.length; i++) {
      const search = searches[i]
      const results = batchResults[i]
      if (!search || !results) continue

      console.log(`\nQuery: ${search.query}`)
      console.log(`Directory: ${search.options.onlyInDirectory}`)
      console.log(`Found ${results.length} files`)
      if (results.length > 0) {
        console.log('First 3 files:')
        console.log(
          results
            .slice(0, 3)
            .map(p => p.split('/').pop())
            .join('\n')
        )
      }
    }

    // Example 2: Search for TypeScript files in multiple directories
    console.log('\n2. Search for TypeScript files in multiple directories:')
    const directories = [downloadsDir, documentsDir, desktopDir]
    const directoryResults = await mdfindMultiDirectory('kMDItemFSName == *.ts', directories)

    // Process and display results
    for (let i = 0; i < directories.length; i++) {
      const results = directoryResults[i]
      if (!results) continue

      console.log(`\nDirectory: ${directories[i]}`)
      console.log(`Found ${results.length} TypeScript files`)
      if (results.length > 0) {
        console.log('First 3 files:')
        console.log(
          results
            .slice(0, 3)
            .map(p => p.split('/').pop())
            .join('\n')
        )
      }
    }

    // Example 3: Search with multiple queries in a single directory
    console.log('\n3. Search with multiple queries in Downloads directory:')
    const queries = ['kind:image', 'kind:document', 'kind:application']
    const queryResults = await mdfindMultiQuery(queries, downloadsDir)

    // Process and display results
    for (let i = 0; i < queries.length; i++) {
      const results = queryResults[i]
      if (!results) continue

      console.log(`\nQuery: ${queries[i]}`)
      console.log(`Found ${results.length} files`)
      if (results.length > 0) {
        console.log('First 3 files:')
        console.log(
          results
            .slice(0, 3)
            .map(p => p.split('/').pop())
            .join('\n')
        )
      }
    }

    // Example 4: Sequential batch search
    console.log('\n4. Sequential batch search:')
    const sequentialSearches = [
      {
        query: 'kind:image date:today',
        options: { onlyInDirectory: downloadsDir }
      },
      {
        query: 'kind:document date:thisweek',
        options: { onlyInDirectory: documentsDir }
      }
    ]

    const sequentialResults = await batchSearchSequential(sequentialSearches)

    // Process and display results
    for (let i = 0; i < sequentialSearches.length; i++) {
      const search = sequentialSearches[i]
      const results = sequentialResults[i]
      if (!search || !results) continue

      console.log(`\nQuery: ${search.query}`)
      console.log(`Directory: ${search.options.onlyInDirectory}`)
      console.log(`Found ${results.length} files`)
      if (results.length > 0) {
        console.log('First 3 files:')
        console.log(
          results
            .slice(0, 3)
            .map(p => p.split('/').pop())
            .join('\n')
        )
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
