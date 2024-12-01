import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getMetadata } from '../src/mdls.js'
import { exec } from 'node:child_process'

// Mock exec to use callback style
vi.mock('node:child_process', () => ({
  exec: vi.fn((command, callback) => {
    if (typeof callback === 'function') {
      callback(null, { stdout: '', stderr: '' })
    }
  })
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

      const metadata = await getMetadata('README.md')
      expect(metadata.kMDItemDisplayName).toBe('README.md')
      expect(metadata.kMDItemContentType).toBe('net.daringfireball.markdown')
      expect(metadata.kMDItemFSSize).toBe(6829)
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

      const metadata = await getMetadata('README.md', {
        raw: true,
        attributes: ['kMDItemContentType', 'kMDItemDisplayName']
      })
      expect(metadata.kMDItemContentType).toBe('net.daringfireball.markdown')
      expect(metadata.kMDItemDisplayName).toBe('README.md')
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

      const metadata = await getMetadata('test.txt')
      const date = metadata.kMDItemContentCreationDate
      expect(date).toBeInstanceOf(Date)
      if (date instanceof Date) {
        expect(date.toISOString()).toBe('2024-01-01T12:00:00.000Z')
      }
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

      const metadata = await getMetadata('test.txt')
      expect(metadata.kMDItemKeywords).toBeNull()
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

      const metadata = await getMetadata('test.txt')
      expect(metadata.kMDItemKeywords).toEqual([])
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

      const metadata = await getMetadata('test.txt')
      expect(metadata.kMDItemKeywords).toEqual(['tag1', 'tag2', 'tag3'])
    })

    it('should handle command errors', async () => {
      // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (typeof callback === 'function') {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(new Error('Command failed'))
        }
      })

      await expect(getMetadata('nonexistent.txt')).rejects.toThrow(
        'Failed to get metadata: Command failed'
      )
    })
  })
})
