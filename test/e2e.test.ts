import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getMetadata } from '../src/mdls.js'
import type { ExtendedMetadata } from '../src/schemas/metadata/index.js'
import { createTestFile, isSpotlightReady, removeTestFile } from './utils/spotlight.js'

const TEST_FILE_CONTENT = `# Test File
This is a test file for E2E testing of mdls functionality.
It contains some basic markdown content that Spotlight can index.
`

describe('End-to-end tests', () => {
  let testFilePath: string

  beforeAll(async () => {
    testFilePath = await createTestFile({
      name: 'e2e-test.md',
      content: TEST_FILE_CONTENT
    })
  })

  afterAll(async () => {
    await removeTestFile(testFilePath)
  })

  describe('getMetadata', () => {
    it('should read all metadata', async () => {
      if (!(await isSpotlightReady(testFilePath))) {
        console.warn('Skipping test - Spotlight indexing not ready')
        return
      }

      const metadata = (await getMetadata(testFilePath, { structured: true })) as ExtendedMetadata

      // Test basic file attributes that should always be present
      expect(metadata.basic).toBeDefined()
      expect(metadata.basic.name).toBe('e2e-test.md')
      expect(metadata.basic.contentType).toMatch(/^(text\/markdown|net\.daringfireball\.markdown)$/)
      expect(metadata.basic.size).toBeGreaterThan(0)

      // Test date attributes
      expect(metadata.basic.created).toBeInstanceOf(Date)
      expect(metadata.basic.modified).toBeInstanceOf(Date)
    })

    it('should read specific attributes', async () => {
      if (!(await isSpotlightReady(testFilePath))) {
        console.warn('Skipping test - Spotlight indexing not ready')
        return
      }

      const metadata = (await getMetadata(testFilePath, {
        structured: true,
        attributes: ['kMDItemFSName', 'kMDItemContentType']
      })) as ExtendedMetadata

      expect(Object.keys(metadata.spotlight)).toHaveLength(2)
      expect(metadata.basic.name).toBe('e2e-test.md')
      expect(metadata.basic.contentType).toMatch(/^(text\/markdown|net\.daringfireball\.markdown)$/)
    })

    it('should handle raw output format', async () => {
      if (!(await isSpotlightReady(testFilePath))) {
        console.warn('Skipping test - Spotlight indexing not ready')
        return
      }

      const metadata = (await getMetadata(testFilePath, {
        raw: true,
        structured: true,
        attributes: ['kMDItemContentType', 'kMDItemFSName']
      })) as ExtendedMetadata

      expect(Object.keys(metadata.spotlight)).toHaveLength(2)
      expect(metadata.basic.contentType).toMatch(/^(text\/markdown|net\.daringfireball\.markdown)$/)
      expect(metadata.basic.name).toBe('e2e-test.md')
    })
  })
})
