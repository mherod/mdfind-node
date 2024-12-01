import { QueryBuilder } from '../src/query-builder.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Find text-based files
    console.log('\n1. Finding text-based files:')
    const textFiles = await new QueryBuilder()
      .isText()
      .useOperator('||')
      .extension('ts')
      .extension('js')
      .extension('md')
      .modifiedAfter(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .inDirectory(process.cwd())
      .maxBuffer(5 * 1024 * 1024) // 5MB buffer
      .execute()

    console.log(`Found ${textFiles.length} text files`)
    console.log(
      'First 3:',
      textFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 2: Find audiovisual content
    console.log('\n2. Finding audiovisual content:')
    const mediaFiles = await new QueryBuilder()
      .isAudiovisual()
      .largerThan(10 * 1024 * 1024) // Larger than 10MB
      .inDirectory(join(homedir(), 'Movies'))
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${mediaFiles.length} media files`)
    console.log(
      'First 3:',
      mediaFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 3: Find bundles
    console.log('\n3. Finding bundles:')
    const bundles = await new QueryBuilder()
      .isBundle()
      .inDirectory('/Applications')
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${bundles.length} bundles`)
    console.log(
      'First 3:',
      bundles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 4: Find Markdown files
    console.log('\n4. Finding Markdown files:')
    const markdownFiles = await new QueryBuilder()
      .isMarkdown()
      .inDirectory(process.cwd())
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${markdownFiles.length} Markdown files`)
    console.log(
      'First 3:',
      markdownFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 5: Find property lists
    console.log('\n5. Finding property lists:')
    const plists = await new QueryBuilder()
      .isPlist()
      .inDirectory(join(homedir(), 'Library', 'Preferences'))
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${plists.length} property lists`)
    console.log(
      'First 3:',
      plists.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 6: Find PDF documents
    console.log('\n6. Finding PDF documents:')
    const pdfs = await new QueryBuilder()
      .isPDF()
      .inDirectory(join(homedir(), 'Documents'))
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${pdfs.length} PDF documents`)
    console.log(
      'First 3:',
      pdfs.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 7: Find JSON files
    console.log('\n7. Finding JSON files:')
    const jsonFiles = await new QueryBuilder()
      .isJSON()
      .inDirectory(process.cwd())
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${jsonFiles.length} JSON files`)
    console.log(
      'First 3:',
      jsonFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 8: Find YAML files
    console.log('\n8. Finding YAML files:')
    const yamlFiles = await new QueryBuilder()
      .isYAML()
      .inDirectory(process.cwd())
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${yamlFiles.length} YAML files`)
    console.log(
      'First 3:',
      yamlFiles.slice(0, 3).map(p => p.split('/').pop())
    )
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

void main().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
