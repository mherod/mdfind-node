import { QueryBuilder } from '../src/query-builder.js'
import { batchSearch, batchSearchSequential } from '../src/batch.js'
import { mdfindMultiDirectory, mdfindMultiQuery } from '../src/batch-utils.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Run multiple searches in parallel
    console.log('\n1. Running multiple searches in parallel:')
    const searches = [
      {
        query: new QueryBuilder().contentType('public.image').hasGPS().toString(),
        options: { onlyInDirectory: join(homedir(), 'Pictures') }
      },
      {
        query: new QueryBuilder()
          .contentType('public.audio')
          .minAudioQuality(44100, 320000)
          .toString(),
        options: { onlyInDirectory: join(homedir(), 'Music') }
      },
      {
        query: new QueryBuilder()
          .contentType('com.adobe.pdf')
          .modifiedAfter(new Date('2024-01-01'))
          .toString(),
        options: { onlyInDirectory: join(homedir(), 'Documents') }
      }
    ]

    const batchResults = await batchSearch(searches)
    for (let i = 0; i < searches.length; i++) {
      console.log(`\nQuery: ${searches[i].query}`)
      console.log(`Directory: ${searches[i].options.onlyInDirectory}`)
      console.log(`Found ${batchResults[i].length} files`)
      console.log(
        'First 3:',
        batchResults[i].slice(0, 3).map(p => p.split('/').pop())
      )
    }

    // Example 2: Search multiple directories
    console.log('\n2. Searching multiple directories:')
    const directories = [
      join(homedir(), 'Documents'),
      join(homedir(), 'Downloads'),
      join(homedir(), 'Desktop')
    ]
    const multiDirQuery = new QueryBuilder()
      .extension('ts')
      .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
      .toString()

    const directoryResults = await mdfindMultiDirectory(multiDirQuery, directories)
    for (let i = 0; i < directories.length; i++) {
      console.log(`\nDirectory: ${directories[i]}`)
      console.log(`Found ${directoryResults[i].length} TypeScript files`)
      console.log(
        'First 3:',
        directoryResults[i].slice(0, 3).map(p => p.split('/').pop())
      )
    }

    // Example 3: Run multiple queries in one directory
    console.log('\n3. Running multiple queries in Documents:')
    const queries = [
      new QueryBuilder().contentType('public.image').hasGPS().toString(),
      new QueryBuilder().contentType('public.movie').toString(),
      new QueryBuilder().contentType('com.adobe.pdf').toString()
    ]

    const documentsPath = join(homedir(), 'Documents')
    const queryResults = await mdfindMultiQuery(queries, documentsPath)
    for (let i = 0; i < queries.length; i++) {
      console.log(`\nQuery: ${queries[i]}`)
      console.log(`Found ${queryResults[i].length} files`)
      console.log(
        'First 3:',
        queryResults[i].slice(0, 3).map(p => p.split('/').pop())
      )
    }

    // Example 4: Run searches sequentially
    console.log('\n4. Running searches sequentially:')
    const sequentialSearches = [
      {
        query: 'kind:image',
        options: { onlyInDirectory: join(homedir(), 'Pictures') }
      },
      {
        query: 'kind:pdf',
        options: { onlyInDirectory: join(homedir(), 'Documents') }
      }
    ]

    const sequentialResults = await batchSearchSequential(sequentialSearches)
    for (let i = 0; i < sequentialSearches.length; i++) {
      console.log(`\nQuery: ${sequentialSearches[i].query}`)
      console.log(`Directory: ${sequentialSearches[i].options.onlyInDirectory}`)
      console.log(`Found ${sequentialResults[i].length} files`)
      console.log(
        'First 3:',
        sequentialResults[i].slice(0, 3).map(p => p.split('/').pop())
      )
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

void main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
