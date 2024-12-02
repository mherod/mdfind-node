/* eslint-disable no-console */
import { getBasicMetadata, getExifData, getExtendedMetadata, getXMPData } from 'mdfind-node'

async function main() {
  try {
    // Example 1: Getting all metadata for a file
    console.log('\n1. Getting all metadata for a file:')
    try {
      const metadata = await getExtendedMetadata('package.json')
      console.log('All metadata:', metadata)
    } catch (error) {
      console.error('Failed to get metadata:', error)
    }

    // Example 2: Getting EXIF data for an image
    console.log('\n2. Getting EXIF data for an image:')
    try {
      const exif = await getExifData('README.md')
      console.log('EXIF data:', exif)
    } catch (error) {
      console.error('Failed to get EXIF data:', error)
    }

    // Example 3: Getting XMP data for a file
    console.log('\n3. Getting XMP data for a file:')
    try {
      const xmp = await getXMPData('tsconfig.json')
      console.log('XMP data:', xmp)
    } catch (error) {
      console.error('Failed to get XMP data:', error)
    }

    // Example 4: Getting basic metadata for files
    console.log('\n4. Getting basic metadata for files:')
    const files = ['package.json', 'README.md', 'tsconfig.json']

    for (const file of files) {
      try {
        console.log(`\n${file}:`)
        const info = await getBasicMetadata(file)
        console.log('- Type:', info.contentType)
        console.log('- Kind:', info.kind)
        console.log('- Size:', info.size)
        console.log('- Created:', info.created?.toLocaleString())
        console.log('- Modified:', info.modified?.toLocaleString())
        console.log('- Last Opened:', info.lastOpened?.toLocaleString())
      } catch (error) {
        console.error(`Failed to get metadata for ${file}:`, error)
      }
    }
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
