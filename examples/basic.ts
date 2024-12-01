import { mdfind, MdfindError } from '../src'

async function main() {
  try {
    // Basic search for all PDF files
    console.log('\n1. Finding PDF files in Downloads:')
    const pdfFiles = await mdfind('kMDItemContentType == "com.adobe.pdf"', {
      onlyIn: '~/Downloads'
    })
    console.log(`Found ${pdfFiles.length} PDF files`)
    console.log('First 3:', pdfFiles.slice(0, 3))

    // Search for images in Downloads folder
    console.log('\n2. Finding PNG images in Downloads:')
    const imageFiles = await mdfind('kMDItemContentType == "public.png"', {
      onlyIn: '~/Downloads'
    })
    console.log(`Found ${imageFiles.length} PNG images`)
    console.log('First 3:', imageFiles.slice(0, 3))

    // Search by filename in current directory
    console.log('\n3. Finding package.json files in current project:')
    const packageFiles = await mdfind('', {
      name: 'package.json',
      onlyIn: process.cwd()
    })
    console.log(`Found ${packageFiles.length} package.json files`)
    console.log('All matches:', packageFiles)

    // Get author metadata from documents
    console.log('\n4. Finding recent documents with author metadata:')
    const authorDocs = await mdfind('kMDItemAuthors == * && kMDItemContentType == "com.adobe.pdf"', {
      attr: 'kMDItemAuthors',
      onlyIn: '~/Documents'
    })
    console.log(`Found ${authorDocs.length} documents with authors`)
    console.log('First 3:', authorDocs.slice(0, 3))

  } catch (error) {
    if (error instanceof MdfindError) {
      console.error('Search failed:', error.message)
      console.error('stderr:', error.stderr)
      process.exit(1)
    }
    throw error
  }
}

main()