import { beforeEach, describe, expect, it, vi } from 'vitest'
import { homedir } from 'node:os'
import { mdfind, MdfindError } from '../src/mdfind.js'
import type { ChildProcess, ExecException } from 'node:child_process'

// Mock child_process.exec
vi.mock('node:child_process', () => ({
  exec: vi.fn()
}))

type ExecCallback = (
  error: ExecException | null,
  result: { stdout: string; stderr: string }
) => void
type ExecOptions = { maxBuffer?: number }

describe('mdfind', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('command building', () => {
    it('should build basic command', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '', stderr: '' })
          return {} as ChildProcess
        }
      )

      await mdfind('test query')
      expect(exec).toHaveBeenCalledWith(
        'mdfind "test query"',
        expect.objectContaining({ maxBuffer: expect.any(Number) }),
        expect.any(Function)
      )
    })

    it('should add onlyIn option with expanded path', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '', stderr: '' })
          return {} as ChildProcess
        }
      )

      await mdfind('test query', { onlyIn: '~/Documents' })
      expect(exec).toHaveBeenCalledWith(
        `mdfind "-onlyin" "${homedir()}/Documents" "test query"`,
        expect.objectContaining({ maxBuffer: expect.any(Number) }),
        expect.any(Function)
      )
    })

    it('should add name option', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '', stderr: '' })
          return {} as ChildProcess
        }
      )

      await mdfind('test query', { name: '*.pdf' })
      expect(exec).toHaveBeenCalledWith(
        'mdfind "-name" "*.pdf" "test query"',
        expect.objectContaining({ maxBuffer: expect.any(Number) }),
        expect.any(Function)
      )
    })

    it('should add live option', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '', stderr: '' })
          return {} as ChildProcess
        }
      )

      await mdfind('test query', { live: true })
      expect(exec).toHaveBeenCalledWith(
        'mdfind "-live" "test query"',
        expect.objectContaining({ maxBuffer: expect.any(Number) }),
        expect.any(Function)
      )
    })

    it('should add count option', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '42', stderr: '' })
          return {} as ChildProcess
        }
      )

      const result = await mdfind('test query', { count: true })
      expect(exec).toHaveBeenCalledWith(
        'mdfind "-count" "test query"',
        expect.objectContaining({ maxBuffer: expect.any(Number) }),
        expect.any(Function)
      )
      expect(result).toEqual(['42'])
    })
  })

  describe('error handling', () => {
    it('should handle command execution errors', async () => {
      const { exec } = await import('node:child_process')
      const error = new Error('Command failed') as ExecException
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(error, { stdout: '', stderr: 'Command failed' })
          return {} as ChildProcess
        }
      )

      await expect(mdfind('test query')).rejects.toThrow(MdfindError)
    })

    it('should handle invalid options', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '', stderr: '' })
          return {} as ChildProcess
        }
      )

      // @ts-expect-error Testing invalid option
      await expect(mdfind('test query', { invalidOption: true })).rejects.toThrow()
    })

    it('should handle empty query', async () => {
      await expect(mdfind('')).rejects.toThrow('Query cannot be empty')
    })
  })

  describe('output parsing', () => {
    it('should parse file list output', async () => {
      const { exec } = await import('node:child_process')
      const mockOutput = '/path/to/file1\n/path/to/file2\n/path/to/file3'
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: mockOutput, stderr: '' })
          return {} as ChildProcess
        }
      )

      const result = await mdfind('test query')
      expect(result).toEqual(['/path/to/file1', '/path/to/file2', '/path/to/file3'])
    })

    it('should handle empty output', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '', stderr: '' })
          return {} as ChildProcess
        }
      )

      const result = await mdfind('test query')
      expect(result).toEqual([])
    })

    it('should parse count output', async () => {
      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation(
        (cmd: string, opts: ExecOptions, callback: ExecCallback) => {
          callback(null, { stdout: '42', stderr: '' })
          return {} as ChildProcess
        }
      )

      const result = await mdfind('test query', { count: true })
      expect(result).toEqual(['42'])
    })
  })
})
