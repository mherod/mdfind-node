import { join } from 'node:path'
import { afterAll, beforeAll, describe, it } from 'vitest'
import { disableIndexing, enableIndexing, eraseIndex, MdutilError } from '../src/mdutil.js'
import { createTestFile, execAsync, removeTestFile } from './utils/spotlight.js'

const TEST_FILE_CONTENT = `# Test File
This is a test file for E2E testing of mdutil functionality.
It contains some basic markdown content that Spotlight can index.
`

// Allow console statements in tests
/* eslint-disable no-console */

describe('mdutil E2E Tests', () => {
  let testFilePath: string
  let testDir: string

  beforeAll(async () => {
    testDir = join(process.cwd(), 'test')
    testFilePath = await createTestFile({
      name: 'mdutil-test.md',
      content: TEST_FILE_CONTENT,
      directory: testDir
    })
  })

  afterAll(async () => {
    await removeTestFile(testFilePath)
  })

  async function canAccessIndexing(): Promise<boolean> {
    try {
      await execAsync(`mdutil -s "${testDir}"`)
      return true
    } catch {
      return false
    }
  }

  async function handleMdutilError(error: unknown, operation: string): Promise<void> {
    if (error instanceof MdutilError) {
      const message = error.message.toLowerCase()
      if (
        message.includes('operation not permitted') ||
        message.includes('requires root privileges') ||
        message.includes('not eligible for spotlight indexing') ||
        message.includes('command failed: mdutil')
      ) {
        console.warn(`Note: ${operation} requires root privileges or eligible path`)
        console.warn('Run tests with sudo to enable full mdutil testing')
        return
      }
    }
    throw error
  }

  it('should disable indexing when permitted', async () => {
    if (!(await canAccessIndexing())) {
      console.warn('Skipping test - cannot access indexing status')
      return
    }

    try {
      await disableIndexing(testDir)
      console.log('Successfully disabled indexing')
    } catch (error) {
      await handleMdutilError(error, 'disabling indexing')
    }
  })

  it('should enable indexing when permitted', async () => {
    if (!(await canAccessIndexing())) {
      console.warn('Skipping test - cannot access indexing status')
      return
    }

    try {
      await enableIndexing(testDir)
      console.log('Successfully enabled indexing')
    } catch (error) {
      await handleMdutilError(error, 'enabling indexing')
    }
  })

  it('should erase and rebuild index when permitted', async () => {
    if (!(await canAccessIndexing())) {
      console.warn('Skipping test - cannot access indexing status')
      return
    }

    try {
      await eraseIndex(testDir)
      console.log('Successfully erased and rebuilt index')
    } catch (error) {
      await handleMdutilError(error, 'erasing index')
    }
  })
})
