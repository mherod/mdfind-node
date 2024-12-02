import { exec } from 'node:child_process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { eraseAndRebuildIndex, getIndexingStatus, setIndexing } from '../src/mdutil.js'

// Mock child_process
vi.mock('node:child_process', () => ({
  exec: vi.fn((command, callback) => {
    if (typeof callback === 'function') {
      callback(null, { stdout: '', stderr: '' })
    }
  }),
  execFile: vi.fn((file, args, callback) => {
    if (typeof callback === 'function') {
      callback(null, { stdout: '', stderr: '' })
    }
  }),
  spawn: vi.fn(() => ({
    stdout: {
      on: vi.fn(),
      pipe: vi.fn()
    },
    stderr: {
      on: vi.fn()
    },
    on: vi.fn((event, callback) => {
      if (event === 'close') {
        callback(0)
      }
    })
  }))
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
        // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
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
        // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
        callback(new Error('Operation not permitted'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(getIndexingStatus('/')).rejects.toThrow('Failed to get indexing status')
    })
  })

  describe('setIndexing', () => {
    beforeEach(() => {
      // Mock getIndexingStatus to return appropriate status based on command
      vi.mocked(exec).mockImplementation((command, callback) => {
        if (command.includes('-i on')) {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: '', stderr: '' })
        } else if (command.includes('-i off')) {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: '', stderr: '' })
        } else if (command.includes('-s')) {
          const isEnabled = !command.includes('off')
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, {
            stdout: isEnabled ? 'Indexing enabled.' : 'Indexing disabled.',
            stderr: ''
          })
        } else {
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: '', stderr: '' })
        }
        return {} as any
      })
    })

    it('should enable indexing', async () => {
      const result = await setIndexing('/', true)
      expect(result.success).toBe(true)
      expect(result.remainingEntries).toEqual([])
    })

    it('should disable indexing', async () => {
      const result = await setIndexing('/', false)
      expect(result.success).toBe(true)
      expect(result.remainingEntries).toEqual([])
    })

    it('should handle invalid operation error', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
        callback(new Error('invalid operation'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(setIndexing('/', true)).rejects.toThrow('Operation not permitted on this path')
    })

    it('should handle unknown state error', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
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
        // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
        callback(null, { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(eraseAndRebuildIndex('/')).resolves.toBeUndefined()
    })

    it('should handle invalid operation error', async () => {
      vi.mocked(exec).mockImplementation((_, callback) => {
        // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
        callback(new Error('invalid operation'), { stdout: '', stderr: '' })
        return {} as any
      })

      await expect(eraseAndRebuildIndex('/')).rejects.toThrow(
        'Operation not permitted on this path'
      )
    })
  })
})
