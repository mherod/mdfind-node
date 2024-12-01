import { getAllVolumesStatus, getIndexingStatus } from '../src/index.js'
import { homedir } from 'os'

async function main() {
  try {
    // Get status of all volumes
    console.log('Checking all volumes...\n')
    const allVolumes = await getAllVolumesStatus({
      verbose: true,
      resolveRealPath: true,
      excludeSystemVolumes: false,
      excludeUnknownState: false
    })

    for (const volume of allVolumes) {
      console.log(`Volume: ${volume.volumePath}`)
      console.log(`State: ${volume.state}`)
      console.log(`System Volume: ${volume.isSystemVolume}`)
      if (volume.scanBaseTime) {
        console.log(`Last Scan: ${volume.scanBaseTime.toLocaleString()}`)
      }
      if (volume.reasoning) {
        console.log(`Reasoning: ${volume.reasoning}`)
      }
      console.log()
    }

    // Get status of only data volumes
    console.log('\nChecking non-system volumes...\n')
    const dataVolumes = await getAllVolumesStatus({
      verbose: true,
      resolveRealPath: true,
      excludeSystemVolumes: true,
      excludeUnknownState: true
    })

    for (const volume of dataVolumes) {
      console.log(`Volume: ${volume.volumePath}`)
      console.log(`State: ${volume.state}`)
      if (volume.scanBaseTime) {
        console.log(`Last Scan: ${volume.scanBaseTime.toLocaleString()}`)
      }
      console.log()
    }

    // Check specific directory
    console.log('\nChecking home directory...\n')
    const homeStatus = await getIndexingStatus(homedir(), {
      verbose: true,
      resolveRealPath: true,
      excludeSystemVolumes: false,
      excludeUnknownState: false
    })
    console.log(`Path: ${homeStatus.volumePath}`)
    console.log(`State: ${homeStatus.state}`)
    if (homeStatus.scanBaseTime) {
      console.log(`Last Scan: ${homeStatus.scanBaseTime.toLocaleString()}`)
    }
    if (homeStatus.reasoning) {
      console.log(`Reasoning: ${homeStatus.reasoning}`)
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
