/* eslint-disable no-console */
import { getMetadata } from 'mdfind-node'

async function main(): Promise<void> {
  try {
    // Example: Get metadata for package.json
    console.log('\nMetadata for package.json:')
    const metadata = await getMetadata('package.json')

    // Basic metadata
    console.log('\nBasic metadata:')
    if (metadata.basic && typeof metadata.basic === 'object' && !Array.isArray(metadata.basic)) {
      if ('name' in metadata.basic) console.log(`Name: ${metadata.basic.name}`)
      if ('contentType' in metadata.basic) console.log(`Type: ${metadata.basic.contentType}`)
      if ('created' in metadata.basic) console.log(`Created: ${metadata.basic.created}`)
      if ('modified' in metadata.basic) console.log(`Modified: ${metadata.basic.modified}`)
    }

    // XMP metadata
    console.log('\nXMP metadata:')
    if (metadata.xmp && typeof metadata.xmp === 'object' && !Array.isArray(metadata.xmp)) {
      // Dublin Core
      if ('dc' in metadata.xmp && metadata.xmp.dc && typeof metadata.xmp.dc === 'object') {
        console.log('\nDublin Core:')
        const dc = metadata.xmp.dc
        if ('title' in dc) console.log('Title:', dc.title)
        if ('creator' in dc) console.log('Creator:', dc.creator)
        if ('description' in dc) console.log('Description:', dc.description)
        if ('subject' in dc) console.log('Subject:', dc.subject)
        if ('rights' in dc) console.log('Rights:', dc.rights)
      }

      // XMP Basic
      if ('xmp' in metadata.xmp && metadata.xmp.xmp && typeof metadata.xmp.xmp === 'object') {
        console.log('\nXMP Basic:')
        const xmp = metadata.xmp.xmp
        if ('creatorTool' in xmp) console.log('Creator Tool:', xmp.creatorTool)
        if ('createDate' in xmp) console.log('Create Date:', xmp.createDate)
        if ('modifyDate' in xmp) console.log('Modify Date:', xmp.modifyDate)
        if ('metadataDate' in xmp) console.log('Metadata Date:', xmp.metadataDate)
      }

      // XMP Rights
      if (
        'xmpRights' in metadata.xmp &&
        metadata.xmp.xmpRights &&
        typeof metadata.xmp.xmpRights === 'object'
      ) {
        console.log('\nXMP Rights:')
        const rights = metadata.xmp.xmpRights
        if ('marked' in rights) console.log('Marked:', rights.marked)
        if ('owner' in rights) console.log('Owner:', rights.owner)
        if ('usageTerms' in rights) console.log('Usage Terms:', rights.usageTerms)
      }

      // XMP Media Management
      if ('xmpMM' in metadata.xmp && metadata.xmp.xmpMM && typeof metadata.xmp.xmpMM === 'object') {
        console.log('\nXMP Media Management:')
        const mm = metadata.xmp.xmpMM
        if ('documentID' in mm) console.log('Document ID:', mm.documentID)
        if ('instanceID' in mm) console.log('Instance ID:', mm.instanceID)
        if ('originalDocumentID' in mm) console.log('Original Document ID:', mm.originalDocumentID)
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
