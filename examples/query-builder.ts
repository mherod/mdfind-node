import { QueryBuilder } from '../src/query-builder.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Find high-resolution photos taken with a specific camera
    console.log('1. Finding high-resolution photos taken with a Canon camera:')
    const photoQuery = new QueryBuilder()
      .contentType('public.image')
      .takenWith('Canon')
      .minImageDimensions(3000, 2000)
      .inDirectory(join(homedir(), 'Pictures'))

    const photos = await photoQuery.execute()
    console.log(`Found ${photos.length} photos`)
    console.log(
      'First 3:',
      photos.slice(0, 3).map((p: string) => p.split('/').pop())
    )

    // Example 2: Find high-quality audio files by an artist
    console.log('\n2. Finding high-quality audio files by an artist:')
    const audioQuery = new QueryBuilder()
      .contentType('public.audio')
      .author('Radiohead')
      .minAudioQuality(44100, 320000)

    const audioFiles = await audioQuery.execute()
    console.log(`Found ${audioFiles.length} audio files`)
    console.log(
      'First 3:',
      audioFiles.slice(0, 3).map((p: string) => p.split('/').pop())
    )

    // Example 3: Find PDF documents with specific keywords
    console.log('\n3. Finding PDF documents about TypeScript:')
    const docQuery = new QueryBuilder()
      .isPDF()
      .hasKeyword('typescript')
      .inDirectory(join(homedir(), 'Documents'))

    const docs = await docQuery.execute()
    console.log(`Found ${docs.length} documents`)
    console.log(
      'First 3:',
      docs.slice(0, 3).map((p: string) => p.split('/').pop())
    )

    // Example 4: Find recently modified code files
    console.log('\n4. Finding recently modified code files:')
    const codeQuery = new QueryBuilder()
      .isText()
      .modifiedAfter(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .extension('ts')
      .inDirectory(process.cwd()) // Only search in current project
      .maxBuffer(10 * 1024 * 1024) // 10MB buffer

    const codeFiles = await codeQuery.execute()
    console.log(`Found ${codeFiles.length} code files`)
    console.log(
      'First 3:',
      codeFiles.slice(0, 3).map((p: string) => p.split('/').pop())
    )
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
