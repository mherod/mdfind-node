import { mdfind } from '../src/index.js'

async function main() {
  try {
    // 1. Find images with GPS data
    console.log('\n1. Finding images with location data:')
    const geotaggedImages = await mdfind('kMDItemLatitude > 0', {
      attr: 'kMDItemLatitude'
    })
    console.log(`Found ${geotaggedImages.length} geotagged images`)
    console.log('First 3 latitude values:', geotaggedImages.slice(0, 3))

    // 2. Find documents modified in the last day using interpreted query
    console.log('\n2. Finding recently modified documents:')
    const recentDocs = await mdfind('modified:today', {
      interpret: true
    })
    console.log(`Found ${recentDocs.length} recently modified documents`)
    console.log(
      'First 3:',
      recentDocs.slice(0, 3).map(p => p.split('/').pop())
    )

    // 3. Find high-resolution images
    console.log('\n3. Finding high-resolution images:')
    const highResImages = await mdfind('kMDItemPixelHeight > 3000 && kMDItemPixelWidth > 4000')
    console.log(`Found ${highResImages.length} high-resolution images`)
    console.log(
      'First 3:',
      highResImages.slice(0, 3).map(p => p.split('/').pop())
    )

    // 4. Find audio files with specific properties
    console.log('\n4. Finding high-quality audio files:')
    const highQualityAudio = await mdfind(
      'kMDItemAudioSampleRate > 44100 && kMDItemAudioBitRate > 320000'
    )
    console.log(`Found ${highQualityAudio.length} high-quality audio files`)
    console.log(
      'First 3:',
      highQualityAudio.slice(0, 3).map(p => p.split('/').pop())
    )

    // 5. Find files by a specific author
    console.log('\n5. Finding documents by author:')
    const authorDocs = await mdfind('kMDItemAuthors == "John Doe"', {
      literal: true // Use exact match
    })
    console.log(`Found ${authorDocs.length} documents by John Doe`)
    console.log(
      'First 3:',
      authorDocs.slice(0, 3).map(p => p.split('/').pop())
    )

    // 6. Find photos taken with a specific camera
    console.log('\n6. Finding photos by camera model:')
    const cameraPhotos = await mdfind('kMDItemAcquisitionModel == "iPhone 14 Pro"')
    console.log(`Found ${cameraPhotos.length} photos taken with iPhone 14 Pro`)
    console.log(
      'First 3:',
      cameraPhotos.slice(0, 3).map(p => p.split('/').pop())
    )
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
