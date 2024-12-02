/* eslint-disable no-console */
import { QueryBuilder } from 'mdfind-node'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  try {
    // Example 1: Professional Photography Workflow
    console.log('\n1. Finding professional photos:')
    const proPhotos = await new QueryBuilder()
      .contentType('public.image')
      .minImageDimensions(3000, 2000)
      .withISO(100, 1600)
      .withFocalLength(24, 200)
      .hasGPS()
      .modifiedAfter(new Date('2024-01-01'))
      .inDirectory(join(homedir(), 'Pictures'))
      .execute()

    console.log(`Found ${proPhotos.length} professional photos`)
    console.log(
      'First 3:',
      proPhotos.slice(0, 3).map((p: string) => p.split('/').pop())
    )

    // Example 2: Portrait Photography
    console.log('\n2. Finding portrait photos:')
    const portraits = await new QueryBuilder()
      .contentType('public.image')
      .withFocalLength(50, 200)
      .withISO(100, 3200)
      .where('kMDItemFNumber <= 2.8') // Using raw query for aperture
      .modifiedAfter(new Date('2024-01-01'))
      .inDirectory(join(homedir(), 'Pictures'))
      .execute()

    console.log(`Found ${portraits.length} portrait photos`)
    console.log(
      'First 3:',
      portraits.slice(0, 3).map((p: string) => p.split('/').pop())
    )

    // Example 3: High-Quality Audio Collection
    console.log('\n3. Finding high-quality audio:')
    const hiResAudio = await new QueryBuilder()
      .contentType('public.audio')
      .minAudioQuality(96000, 1411000) // 96kHz/24-bit FLAC equivalent
      .withBitDepth(24)
      .largerThan(50 * 1024 * 1024)
      .inDirectory(join(homedir(), 'Music'))
      .execute()

    console.log(`Found ${hiResAudio.length} high-resolution audio files`)
    console.log(
      'First 3:',
      hiResAudio.slice(0, 3).map((p: string) => p.split('/').pop())
    )

    // Example 4: Classical Music Collection
    console.log('\n4. Finding classical music:')
    const classicalMusic = await new QueryBuilder()
      .contentType('public.audio')
      .inGenre('Classical')
      .byComposer('Mozart')
      .where('kMDItemDurationSeconds >= 300 && kMDItemDurationSeconds <= 1800')
      .inDirectory(join(homedir(), 'Music'))
      .execute()

    console.log(`Found ${classicalMusic.length} classical music files`)
    console.log(
      'First 3:',
      classicalMusic.slice(0, 3).map((p: string) => p.split('/').pop())
    )
  } catch (error) {
    console.error('Error:', error)
  }
}

main().catch(console.error)
