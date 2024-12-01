import { QueryBuilder } from '../src/query-builder.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Find applications
    console.log('\n1. Finding applications:')
    const apps = await new QueryBuilder()
      .isApplication()
      .inDirectory('/Applications')
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${apps.length} applications`)
    console.log(
      'First 3:',
      apps.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 2: Find recent images
    console.log('\n2. Finding recent images:')
    const images = await new QueryBuilder()
      .useOperator('||')
      .contentType('public.jpeg')
      .contentType('public.png')
      .contentType('public.heic')
      .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
      .inDirectory(join(homedir(), 'Pictures'))
      .maxBuffer(5 * 1024 * 1024)
      .execute()

    console.log(`Found ${images.length} recent images`)
    console.log(
      'First 3:',
      images.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 3: Find recent property lists
    console.log('\n3. Finding recent property lists:')
    const plists = await new QueryBuilder()
      .contentType('com.apple.property-list')
      .modifiedAfter(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .inDirectory(join(homedir(), 'Library'))
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${plists.length} recent property lists`)
    console.log(
      'First 3:',
      plists.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 4: Find recent source code files
    console.log('\n4. Finding recent source code files:')
    const sourceFiles = await new QueryBuilder()
      .useOperator('||')
      .extension('ts')
      .extension('js')
      .extension('py')
      .extension('swift')
      .extension('sh')
      .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
      .inDirectory(homedir())
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${sourceFiles.length} recent source files`)
    console.log(
      'First 3:',
      sourceFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 5: Find recent documents
    console.log('\n5. Finding recent documents:')
    const docs = await new QueryBuilder()
      .useOperator('||')
      .contentType('com.adobe.pdf')
      .contentType('public.plain-text')
      .contentType('public.rtf')
      .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
      .inDirectory(join(homedir(), 'Documents'))
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${docs.length} recent documents`)
    console.log(
      'First 3:',
      docs.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 6: Find recent large files
    console.log('\n6. Finding recent large files:')
    const largeFiles = await new QueryBuilder()
      .largerThan(100 * 1024 * 1024) // Larger than 100MB
      .modifiedAfter(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      .inDirectory(homedir())
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${largeFiles.length} recent large files`)
    console.log(
      'First 3:',
      largeFiles.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 7: Find recent downloads
    console.log('\n7. Finding recent downloads:')
    const downloads = await new QueryBuilder()
      .inDirectory(join(homedir(), 'Downloads'))
      .modifiedAfter(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${downloads.length} recent downloads`)
    console.log(
      'First 3:',
      downloads.slice(0, 3).map(p => p.split('/').pop())
    )

    // Example 8: Find recent shell scripts
    console.log('\n8. Finding recent shell scripts:')
    const scripts = await new QueryBuilder()
      .contentType('public.shell-script')
      .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
      .inDirectory(homedir())
      .maxBuffer(2 * 1024 * 1024)
      .execute()

    console.log(`Found ${scripts.length} recent shell scripts`)
    console.log(
      'First 3:',
      scripts.slice(0, 3).map(p => p.split('/').pop())
    )
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
