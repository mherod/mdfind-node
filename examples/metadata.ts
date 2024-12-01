import { getMetadata } from '../src/index.js'

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Please provide a file path')
    process.exit(1)
  }

  try {
    const metadata = await getMetadata(filePath, { structured: true, raw: false })

    // Display basic file info
    console.log('\nBasic File Information:')
    console.log('----------------------')
    console.log(`Name: ${metadata.basic.name}`)
    console.log(`Type: ${metadata.basic.contentType}`)
    console.log(`Created: ${metadata.basic.created}`)
    console.log(`Modified: ${metadata.basic.modified}`)

    // Display XMP metadata if available
    console.log('\nXMP Metadata:')
    console.log('------------')

    // Dublin Core metadata
    if (metadata.xmp?.dc) {
      console.log('\nDublin Core:')
      console.log('Title:', metadata.xmp.dc.title)
      console.log('Creator:', metadata.xmp.dc.creator)
      console.log('Description:', metadata.xmp.dc.description)
      console.log('Subject:', metadata.xmp.dc.subject)
      console.log('Rights:', metadata.xmp.dc.rights)
    }

    // XMP Basic
    if (metadata.xmp?.xmp) {
      console.log('\nXMP Basic:')
      console.log('Creator Tool:', metadata.xmp.xmp.creatorTool)
      console.log('Create Date:', metadata.xmp.xmp.createDate)
      console.log('Modify Date:', metadata.xmp.xmp.modifyDate)
      console.log('Metadata Date:', metadata.xmp.xmp.metadataDate)
    }

    // XMP Rights
    if (metadata.xmp?.xmpRights) {
      console.log('\nXMP Rights:')
      console.log('Marked:', metadata.xmp.xmpRights.marked)
      console.log('Owner:', metadata.xmp.xmpRights.owner)
      console.log('Usage Terms:', metadata.xmp.xmpRights.usageTerms)
    }

    // XMP Media Management
    if (metadata.xmp?.xmpMM) {
      console.log('\nXMP Media Management:')
      console.log('Document ID:', metadata.xmp.xmpMM.documentID)
      console.log('Instance ID:', metadata.xmp.xmpMM.instanceID)
      console.log('Original Document ID:', metadata.xmp.xmpMM.originalDocumentID)
    }

    // Display raw spotlight metadata for inspection
    console.log('\nRaw Spotlight Metadata:')
    console.log('---------------------')
    console.log(JSON.stringify(metadata.spotlight, null, 2))
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
