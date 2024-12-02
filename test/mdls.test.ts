import { exec } from 'node:child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMetadata } from '../src/mdls.js'
import type { ExtendedMetadata } from '../src/schemas/metadata/index.js'

vi.mock('node:child_process', () => ({
  exec: vi.fn()
}))

describe('mdls', () => {
  describe('getMetadata', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should parse basic metadata correctly', async () => {
      const mockOutput = `kMDItemContentType = "net.daringfireball.markdown"
kMDItemDisplayName = "README.md"
kMDItemFSSize      = 6829`

      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: mockOutput, stderr: '' })
        }
      })

      const metadata = (await getMetadata('README.md', { structured: true })) as ExtendedMetadata
      expect(metadata.basic.name).toBe('README.md')
      expect(metadata.basic.contentType).toBe('net.daringfireball.markdown')
      expect(metadata.basic.size).toBe(6829)
      expect(metadata.spotlight.kMDItemDisplayName).toBe('README.md')
      expect(metadata.spotlight.kMDItemContentType).toBe('net.daringfireball.markdown')
      expect(metadata.spotlight.kMDItemFSSize).toBe(6829)
    })

    it('should handle raw output format', async () => {
      // Raw format concatenates values with null bytes
      const mockOutput = 'net.daringfireball.markdown\0README.md'

      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: mockOutput, stderr: '' })
        }
      })

      const metadata = (await getMetadata('README.md', {
        raw: true,
        structured: true,
        attributes: ['kMDItemContentType', 'kMDItemDisplayName']
      })) as ExtendedMetadata
      expect(metadata.basic.contentType).toBe('net.daringfireball.markdown')
      expect(metadata.basic.name).toBe('README.md')
      expect(metadata.spotlight.kMDItemContentType).toBe('net.daringfireball.markdown')
      expect(metadata.spotlight.kMDItemDisplayName).toBe('README.md')
    })

    it('should handle dates correctly', async () => {
      const mockOutput = 'kMDItemContentCreationDate = 2024-01-01 12:00:00 +0000'

      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: mockOutput, stderr: '' })
        }
      })

      const metadata = (await getMetadata('test.txt', { structured: true })) as ExtendedMetadata
      expect(metadata.basic.created).toBeInstanceOf(Date)
      expect((metadata.basic.created as Date).toISOString()).toBe('2024-01-01T12:00:00.000Z')
      expect(metadata.spotlight.kMDItemContentCreationDate).toBeInstanceOf(Date)
      expect((metadata.spotlight.kMDItemContentCreationDate as Date).toISOString()).toBe(
        '2024-01-01T12:00:00.000Z'
      )
    })

    it('should handle null values', async () => {
      const mockOutput = 'kMDItemKeywords = (null)'

      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: mockOutput, stderr: '' })
        }
      })

      const metadata = (await getMetadata('test.txt', { structured: true })) as ExtendedMetadata
      expect(metadata.xmp?.subject).toBeNull()
      expect(metadata.spotlight.kMDItemKeywords).toBeNull()
    })

    it('should handle empty arrays', async () => {
      const mockOutput = 'kMDItemKeywords = ()'

      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: mockOutput, stderr: '' })
        }
      })

      const metadata = (await getMetadata('test.txt', { structured: true })) as ExtendedMetadata
      expect(metadata.xmp?.subject).toEqual([])
      expect(metadata.spotlight.kMDItemKeywords).toEqual([])
    })

    it('should handle arrays with values', async () => {
      const mockOutput = 'kMDItemKeywords = ("tag1", "tag2", "tag3")'

      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: mockOutput, stderr: '' })
        }
      })

      const metadata = (await getMetadata('test.txt', { structured: true })) as ExtendedMetadata
      expect(metadata.xmp?.subject).toEqual(['tag1', 'tag2', 'tag3'])
      expect(metadata.spotlight.kMDItemKeywords).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should handle command errors', async () => {
      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(new Error('Command failed'))
        }
      })

      await expect(getMetadata('nonexistent.txt', { structured: true })).rejects.toThrow(
        'Failed to get metadata: Command failed'
      )
    })
  })
})
