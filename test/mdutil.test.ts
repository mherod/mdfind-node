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

vi.mock('../src/index.js', () => ({
  mdfind: vi.fn().mockResolvedValue([])
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
      let indexingEnabled = false

      // Mock exec to properly simulate mdutil behavior
      vi.mocked(exec).mockImplementation((command, callback) => {
        console.log('Executing command:', command)

        // Extract path from command, handling both quoted and unquoted formats
        const pathMatch = command.match(/(?:"([^"]+)"|([^ ]+))$/)
        const path = pathMatch ? (pathMatch[1] ?? pathMatch[2]) : '/'

        // Handle indexing commands
        if (command.includes('mdutil -i on')) {
          indexingEnabled = true
          console.log('Enabling indexing, state:', indexingEnabled, 'path:', path)
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, {
            stdout: `${path}:
              Indexing enabled.`,
            stderr: ''
          })
        } else if (command.includes('mdutil -i off')) {
          indexingEnabled = false
          console.log('Disabling indexing, state:', indexingEnabled, 'path:', path)
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, {
            stdout: `${path}:
              Indexing disabled.`,
            stderr: ''
          })
        } else if (command.includes('mdutil') && command.includes('-s')) {
          // Return current indexing state matching the last operation
          console.log('Checking status, state:', indexingEnabled, 'path:', path)
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, {
            stdout: `${path}:
              ${indexingEnabled ? 'Indexing enabled.' : 'Indexing disabled.'}`,
            stderr: ''
          })
        } else if (command.includes('mdfind')) {
          // Mock mdfind to return no results
          // @ts-expect-error - Mock callback type doesn't match exec callback but is sufficient for testing
          callback(null, { stdout: '', stderr: '' })
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
