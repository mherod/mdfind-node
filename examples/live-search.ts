import { mdfind, mdfindLive } from '../src'
import { homedir } from 'os'
import { join } from 'path'

const DOWNLOADS = join(homedir(), 'Downloads')

console.log('Starting live search for PDF files...')
console.log('This will monitor for new or modified PDF files.')
console.log('Press Ctrl+C to stop\n')

// First get initial results
const initialResults = await mdfind('kMDItemContentType == "com.adobe.pdf"', {
  onlyIn: DOWNLOADS
})

console.log('Initial PDF files found:', initialResults.length)
if (initialResults.length > 0) {
  console.log('\nCurrent PDF files:')
  initialResults.forEach(path => {
    const filename = path.split('/').pop()
    console.log(`- ${filename}`)
  })
}

console.log('\nWaiting for changes...')

// Then start live monitoring
const search = mdfindLive('kMDItemContentType == "com.adobe.pdf"', {
  onlyIn: DOWNLOADS,
  reprint: true
}, {
  onResult: (paths) => {
    console.log('\nUpdate detected!')
    if (paths.length > 0) {
      console.log('\nFound PDF files:')
      paths.forEach(path => {
        const filename = path.split('/').pop()
        console.log(`- ${filename}`)
      })
    } else {
      console.log('No PDF files found')
    }
    console.log('\nWaiting for changes...')
  },
  onError: (error) => {
    console.error('\nSearch error:', error.message)
    if (error.stderr) console.error('stderr:', error.stderr)
  },
  onEnd: () => {
    console.log('\nSearch ended')
  }
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nStopping live search...')
  search.kill()
})