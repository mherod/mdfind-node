import { mdfind } from '../src/mdfind.js'
import { SpotlightQuery } from '../src/query-builder.js'

async function main() {
  try {
    // Example 1: Find recent high-res photos with GPS data
    console.log('\n1. Finding recent high-res photos with GPS data:')
    const photoQuery = new SpotlightQuery()
      .contentType('public.image')
      .createdAfter(new Date('2023-01-01'))
      .hasGPS()
      .minImageDimensions(3000, 2000)

    const photos = await mdfind(photoQuery.toString())
    console.log(`Found ${photos.length} photos`)
    console.log(
      'First 3:',
      photos.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 2: Find high-quality audio files by a specific artist
    console.log('\n2. Finding high-quality audio files by an artist:')
    const audioQuery = new SpotlightQuery()
      .contentType('public.audio')
      .byAuthor('Radiohead')
      .minAudioQuality(44100, 320000)

    const audioFiles = await mdfind(audioQuery.toString())
    console.log(`Found ${audioFiles.length} audio files`)
    console.log(
      'First 3:',
      audioFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 3: Find PDF documents with specific keywords
    console.log('\n3. Finding PDF documents with specific keywords:')
    const pdfQuery = new SpotlightQuery()
      .contentType('com.adobe.pdf')
      .useOperator('||')
      .hasKeyword('typescript')
      .hasKeyword('javascript')

    const pdfs = await mdfind(pdfQuery.toString())
    console.log(`Found ${pdfs.length} PDF files`)
    console.log(
      'First 3:',
      pdfs.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 4: Find recently modified source code files
    console.log('\n4. Finding recently modified source code files:')
    const codeQuery = new SpotlightQuery()
      .useOperator('||')
      .extension('ts')
      .extension('js')
      .modifiedAfter(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours

    const codeFiles = await mdfind(codeQuery.toString())
    console.log(`Found ${codeFiles.length} code files`)
    console.log(
      'First 3:',
      codeFiles.slice(0, 3).map(p => p.split('/').pop())
    )
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
