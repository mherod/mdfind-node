import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eraseAndRebuildIndex, getIndexingStatus, setIndexing } from '../src/mdutil.js'
import { exec } from 'node:child_process'

// Mock exec to use callback style
vi.mock('node:child_process', () => ({
  exec: vi.fn((command, callback) => {
    if (typeof callback === 'function') {
      callback(null, { stdout: '', stderr: '' })
    }
  })
}))

describe('mdutil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getIndexingStatus', () => {
    it('should parse status output correctly', async () => {
      const mockOutput = `/System/Volumes/Data/Users/test:
        Indexing enabled.`

      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(null, { stdout: mockOutput, stderr: '' })
        return {} as any
      })

      const status = await getIndexingStatus('/')
      expect(status.state).toBe('enabled')
      expect(status.enabled).toBe(true)
      expect(status.status).toBe(mockOutput.trim())
      expect(status.volumePath).toBe('/')
      expect(status.isSystemVolume).toBe(false)
    })

    it('should handle errors', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(new Error('Operation not permitted'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(getIndexingStatus('/')).rejects.toThrow('Failed to get indexing status')
    })
  })

  describe('setIndexing', () => {
    it('should enable indexing', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(null, { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(setIndexing('/', true)).resolves.toBeUndefined()
    })

    it('should disable indexing', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(null, { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(setIndexing('/', false)).resolves.toBeUndefined()
    })

    it('should handle invalid operation error', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(new Error('invalid operation'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(setIndexing('/', true)).rejects.toThrow('Operation not permitted on this path')
    })

    it('should handle unknown state error', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(new Error('unknown indexing state'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(setIndexing('/', true)).rejects.toThrow(
        'Path is not eligible for Spotlight indexing'
      )
    })
  })

  describe('eraseAndRebuildIndex', () => {
    it('should erase and rebuild index', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(null, { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(eraseAndRebuildIndex('/')).resolves.toBeUndefined()
    })

    it('should handle invalid operation error', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        callback(new Error('invalid operation'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(eraseAndRebuildIndex('/')).rejects.toThrow(
        'Operation not permitted on this path'
      )
    })
  })
})
