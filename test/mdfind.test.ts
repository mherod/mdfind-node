import { beforeEach, describe, expect, it, vi } from 'vitest'
import { homedir } from 'node:os'
import { mdfind, MdfindError } from '../src/mdfind.js'
import type { ChildProcess } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { Buffer } from 'node:buffer'

// Mock child_process.spawn
vi.mock('node:child_process', () => ({
  spawn: vi.fn()
}))

class MockChildProcess extends EventEmitter {
  public stdout = new EventEmitter()
  public stderr = new EventEmitter()
}

describe('mdfind', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('command building', () => {
    it('should build basic command', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query')
      mockProcess.stdout.emit('data', Buffer.from(''))
      mockProcess.emit('close', 0)

      await promise
      expect(spawn).toHaveBeenCalledWith(
        'mdfind',
        ['test query'],
        expect.objectContaining({ env: expect.any(Object) })
      )
    })

    it('should add onlyIn option with expanded path', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query', { onlyIn: '~/Documents' })
      mockProcess.stdout.emit('data', Buffer.from(''))
      mockProcess.emit('close', 0)

      await promise
      expect(spawn).toHaveBeenCalledWith(
        'mdfind',
        ['-onlyin', `${homedir()}/Documents`, 'test query'],
        expect.objectContaining({ env: expect.any(Object) })
      )
    })

    it('should add name option', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query', { name: '*.pdf' })
      mockProcess.stdout.emit('data', Buffer.from(''))
      mockProcess.emit('close', 0)

      await promise
      expect(spawn).toHaveBeenCalledWith(
        'mdfind',
        ['-name', '*.pdf', 'test query'],
        expect.objectContaining({ env: expect.any(Object) })
      )
    })

    it('should add live option', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query', { live: true })
      mockProcess.stdout.emit('data', Buffer.from(''))
      mockProcess.emit('close', 0)

      await promise
      expect(spawn).toHaveBeenCalledWith(
        'mdfind',
        ['-live', 'test query'],
        expect.objectContaining({ env: expect.any(Object) })
      )
    })

    it('should add count option', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query', { count: true })
      mockProcess.stdout.emit('data', Buffer.from('42'))
      mockProcess.emit('close', 0)

      const result = await promise
      expect(spawn).toHaveBeenCalledWith(
        'mdfind',
        ['-count', 'test query'],
        expect.objectContaining({ env: expect.any(Object) })
      )
      expect(result).toEqual(['42'])
    })
  })

  describe('error handling', () => {
    it('should handle command execution errors', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query')
      mockProcess.stderr.emit('data', Buffer.from('Command failed'))
      mockProcess.emit('close', 1)

      await expect(promise).rejects.toThrow(MdfindError)
    })

    it('should handle invalid options', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query', { invalidOption: true } as any)
      mockProcess.stderr.emit('data', Buffer.from('Invalid option'))
      mockProcess.emit('close', 1)

      await expect(promise).rejects.toThrow(MdfindError)
    })

    it('should handle empty query', async () => {
      await expect(mdfind('')).rejects.toThrow('Query cannot be empty')
    })
  })

  describe('output parsing', () => {
    it('should parse file list output', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query')
      mockProcess.stdout.emit('data', Buffer.from('/path/to/file1\n/path/to/file2\n/path/to/file3'))
      mockProcess.emit('close', 0)

      const result = await promise
      expect(result).toEqual(['/path/to/file1', '/path/to/file2', '/path/to/file3'])
    })

    it('should handle empty output', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query')
      mockProcess.stdout.emit('data', Buffer.from(''))
      mockProcess.emit('close', 0)

      const result = await promise
      expect(result).toEqual([])
    })

    it('should parse count output', async () => {
      const { spawn } = await import('node:child_process')
      const mockProcess = new MockChildProcess()
      vi.mocked(spawn).mockReturnValue(mockProcess as unknown as ChildProcess)

      const promise = mdfind('test query', { count: true })
      mockProcess.stdout.emit('data', Buffer.from('42'))
      mockProcess.emit('close', 0)

      const result = await promise
      expect(result).toEqual(['42'])
    })
  })
})
