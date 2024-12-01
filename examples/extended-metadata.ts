import { getExtendedMetadata, getExifData, getXMPData, getBasicMetadata } from '../src/metadata.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Get all metadata for an image
    console.log('\n1. Getting all metadata for a recent photo:')
    const photoPath = join(homedir(), 'Pictures', 'Photos Library.photoslibrary')
    try {
      const metadata = await getExtendedMetadata(photoPath)
      console.log('\nBasic Info:')
      console.log(JSON.stringify(metadata.basic, null, 2))
      console.log('\nEXIF Data:')
      console.log(JSON.stringify(metadata.exif, null, 2))
      console.log('\nXMP Data:')
      console.log(JSON.stringify(metadata.xmp, null, 2))
    } catch (error) {
      if (error instanceof Error) {
        console.log('No Photos Library found:', error.message)
      }
    }

    // Example 2: Get EXIF data for a photo
    console.log('\n2. Getting EXIF data for a photo:')
    try {
      const exifData = await getExifData(photoPath)
      console.log('\nCamera Info:')
      console.log('- Make:', exifData.make)
      console.log('- Model:', exifData.model)
      console.log('- Lens:', exifData.lens)
      console.log('\nSettings:')
      console.log('- Exposure Time:', exifData.exposureTime)
      console.log('- F-Number:', exifData.fNumber)
      console.log('- ISO:', exifData.isoSpeedRatings)
      console.log('- Focal Length:', exifData.focalLength)
      if (exifData.gpsLatitude) {
        console.log('\nLocation:')
        console.log('- Latitude:', exifData.gpsLatitude)
        console.log('- Longitude:', exifData.gpsLongitude)
        console.log('- Altitude:', exifData.gpsAltitude)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('No Photos Library found:', error.message)
      }
    }

    // Example 3: Get XMP data for a document
    console.log('\n3. Getting XMP data for a PDF:')
    const pdfPath = join(homedir(), 'Library', 'Preferences', 'com.apple.LaunchServices.plist')
    try {
      const xmpData = await getXMPData(pdfPath)
      console.log('\nDocument Info:')
      console.log('- Title:', xmpData.title)
      console.log('- Creator:', xmpData.creator)
      console.log('- Description:', xmpData.description)
      console.log('- Keywords:', xmpData.subject?.join(', '))
      console.log('- Created:', xmpData.createDate)
      console.log('- Modified:', xmpData.modifyDate)
      console.log('\nRights:')
      console.log('- Copyright:', xmpData.copyrightNotice)
      console.log('- Rights:', xmpData.rights)
      console.log('- Web Statement:', xmpData.webStatement)
    } catch (error) {
      if (error instanceof Error) {
        console.log('No LaunchServices.plist found:', error.message)
      }
    }

    // Example 4: Get basic metadata for multiple files
    console.log('\n4. Getting basic metadata for system files:')
    const files = [
      join(homedir(), 'Library', 'Preferences', 'com.apple.LaunchServices.plist'),
      join(homedir(), 'Library', 'Preferences', 'com.apple.finder.plist'),
      join(homedir(), 'Library', 'Preferences', 'com.apple.dock.plist')
    ]

    for (const file of files) {
      try {
        const basicData = await getBasicMetadata(file)
        console.log(`\n${basicData.name}:`)
        console.log('- Type:', basicData.contentType)
        console.log('- Kind:', basicData.kind)
        console.log('- Size:', basicData.size)
        console.log('- Created:', basicData.created)
        console.log('- Modified:', basicData.modified)
        console.log('- Last Opened:', basicData.lastOpened)
      } catch (error) {
        if (error instanceof Error) {
          console.log(`\nFile not found: ${file}`)
        }
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
