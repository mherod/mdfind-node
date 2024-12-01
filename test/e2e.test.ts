import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { getMetadata } from '../src/mdls.js'
import { disableIndexing, enableIndexing, eraseIndex } from '../src/mdutil.js'

const execAsync = promisify(exec)
const TEST_FILE_PATH = join(process.cwd(), 'test', 'e2e-test.md')
const TEST_FILE_CONTENT = `# Test File
This is a test file for E2E testing of mdls and mdutil functionality.
It contains some basic markdown content that Spotlight can index.
`

// Allow console statements in tests
/* eslint-disable no-console */

describe('E2E Tests', () => {
  beforeAll(async () => {
    // Create a test file we can control
    await writeFile(TEST_FILE_PATH, TEST_FILE_CONTENT, 'utf-8')

    // Force immediate indexing of the test file
    await execAsync(`mdimport -i "${TEST_FILE_PATH}"`)

    // Small delay to ensure indexing completes
    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })
  })

  afterAll(async () => {
    // Clean up test file
    try {
      await unlink(TEST_FILE_PATH)
    } catch (error) {
      console.error('Failed to clean up test file:', error)
    }
  })

  describe('mdls', () => {
    it('should read basic metadata from a real file', async () => {
      const metadata = await getMetadata(TEST_FILE_PATH)

      // Test basic file attributes that should always be present
      expect(metadata).toBeDefined()
      expect(metadata.kMDItemFSName).toBe('e2e-test.md')
      expect(metadata.kMDItemContentType).toMatch(
        /^(text\/markdown|net\.daringfireball\.markdown)$/
      )
      expect(typeof metadata.kMDItemFSSize).toBe('number')
      expect(metadata.kMDItemFSSize).toBeGreaterThan(0)

      // Test date attributes
      expect(metadata.kMDItemContentCreationDate).toBeInstanceOf(Date)
      expect(metadata.kMDItemContentModificationDate).toBeInstanceOf(Date)
    })

    it('should read specific attributes', async () => {
      const metadata = await getMetadata(TEST_FILE_PATH, {
        attributes: ['kMDItemFSName', 'kMDItemContentType']
      })

      expect(Object.keys(metadata)).toHaveLength(2)
      expect(metadata.kMDItemFSName).toBe('e2e-test.md')
      expect(metadata.kMDItemContentType).toMatch(
        /^(text\/markdown|net\.daringfireball\.markdown)$/
      )
    })

    it('should handle raw output format', async () => {
      const metadata = await getMetadata(TEST_FILE_PATH, {
        raw: true,
        attributes: ['kMDItemContentType', 'kMDItemFSName']
      })

      expect(Object.keys(metadata)).toHaveLength(2)
      expect(metadata.kMDItemContentType).toMatch(
        /^(text\/markdown|net\.daringfireball\.markdown)$/
      )
      expect(metadata.kMDItemFSName).toBe('e2e-test.md')
    })
  })

  describe('mdutil', () => {
    it('should handle indexing operations or skip if no permissions', async () => {
      const testDir = join(process.cwd(), 'test')

      try {
        // Try to get current indexing status
        await execAsync(`mdutil -s "${testDir}"`)
      } catch (error) {
        console.warn('Skipping mdutil tests - cannot access indexing status')
        return
      }

      try {
        // Test disabling indexing
        await disableIndexing(testDir)
        console.log('Successfully disabled indexing')

        // Test enabling indexing
        await enableIndexing(testDir)
        console.log('Successfully enabled indexing')

        // Test erasing and rebuilding index
        await eraseIndex(testDir)
        console.log('Successfully erased and rebuilt index')
      } catch (error) {
        // If we get permission errors, mark test as passed but log warning
        if (
          error instanceof Error &&
          (error.message.includes('Operation not permitted') ||
            error.message.includes('requires root privileges'))
        ) {
          console.warn('Note: mdutil modification tests require root privileges')
          console.warn('Run tests with sudo to enable full mdutil testing')
          return
        }
        throw error
      }
    })
  })
})
