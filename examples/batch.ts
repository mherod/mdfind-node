import { QueryBuilder } from '../src/query-builder.js'
import { mdfindBatch, mdfindMultiDirectory, mdfindMultiQuery } from '../src/batch.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Run multiple searches in parallel
    console.log('\n1. Running multiple searches in parallel:')
    const searches = [
      {
        query: new QueryBuilder().contentType('public.image').hasGPS().toString(),
        onlyIn: join(homedir(), 'Pictures')
      },
      {
        query: new QueryBuilder()
          .contentType('public.audio')
          .minAudioQuality(44100, 320000)
          .toString(),
        onlyIn: join(homedir(), 'Music')
      },
      {
        query: new QueryBuilder()
          .contentType('com.adobe.pdf')
          .modifiedAfter(new Date('2024-01-01'))
          .toString(),
        onlyIn: join(homedir(), 'Documents')
      }
    ]

    const batchResults = await mdfindBatch(searches)
    for (const result of batchResults) {
      console.log(`\nQuery: ${result.query}`)
      console.log(`Directory: ${result.options.onlyIn}`)
      if (result.error) {
        console.error('Error:', result.error.message)
      } else {
        console.log(`Found ${result.results.length} files`)
        console.log(
          'First 3:',
          result.results.slice(0, 3).map(p => p.split('/').pop())
        )
      }
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
    for (const result of directoryResults) {
      console.log(`\nDirectory: ${result.options.onlyIn}`)
      if (result.error) {
        console.error('Error:', result.error.message)
      } else {
        console.log(`Found ${result.results.length} TypeScript files`)
        console.log(
          'First 3:',
          result.results.slice(0, 3).map(p => p.split('/').pop())
        )
      }
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
    for (const result of queryResults) {
      console.log(`\nQuery: ${result.query}`)
      if (result.error) {
        console.error('Error:', result.error.message)
      } else {
        console.log(`Found ${result.results.length} files`)
        console.log(
          'First 3:',
          result.results.slice(0, 3).map(p => p.split('/').pop())
        )
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
