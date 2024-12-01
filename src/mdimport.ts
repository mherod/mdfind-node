import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'

const execFileAsync = promisify(execFile)

/**
 * Custom error class for mdimport-related errors.
 * Provides additional context about the error and whether root access is required.
 */
export class MdimportError extends Error {
  public readonly name = 'MdimportError' as const

  constructor(
    message: string,
    public readonly stderr: string,
    public readonly requiresRoot: boolean = false
  ) {
    super(message)
  }
}

/**
 * Debug levels for mdimport testing
 */
export const MdimportDebugLevel = {
  /** Print summary of test import */
  SUMMARY: 1,
  /** Print summary and all attributes (except kMDItemTextContent) */
  ATTRIBUTES: 2,
  /** Print summary and all attributes (including kMDItemTextContent) */
  FULL: 3
} as const

/**
 * Options for mdimport operations
 */
export const MdimportOptionsSchema = z
  .object({
    /** Test import without storing in index */
    test: z.boolean().default(false),
    /** Debug level (requires test mode) */
    debugLevel: z.enum(['1', '2', '3']).optional(),
    /** Output file for test results */
    outputFile: z.string().optional(),
    /** Show performance information (requires test mode) */
    showPerformance: z.boolean().default(false),
    /** Maximum buffer size for output */
    maxBuffer: z.number().default(1024 * 512),
    /** Force immediate indexing */
    immediate: z.boolean().default(false)
  })
  .strict()

export type MdimportOptions = z.input<typeof MdimportOptionsSchema>

/**
 * Import files or directories into the Spotlight index
 * @param paths Files or directories to import
 * @param options Import options
 * @returns The command output as a string
 * @throws {MdimportError} If the import fails
 */
export async function mdimport(
  paths: string | string[],
  options: MdimportOptions = {}
): Promise<string> {
  const opts = MdimportOptionsSchema.parse(options)
  const args: string[] = []

  if (opts.immediate) {
    args.push('-i')
  } else if (opts.test) {
    args.push('-t')
    if (opts.debugLevel) {
      args.push('-d', opts.debugLevel)
    }
    if (opts.outputFile) {
      args.push('-o', opts.outputFile)
    }
    if (opts.showPerformance) {
      args.push('-p')
    }
  }

  const pathArray = Array.isArray(paths) ? paths : [paths]
  args.push(...pathArray)

  try {
    const { stdout, stderr } = await execFileAsync('mdimport', args, {
      maxBuffer: opts.maxBuffer
    })

    if (stderr) {
      throw new MdimportError('mdimport command failed', stderr)
    }

    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdimportError(
        `Failed to import: ${error.message}`,
        error instanceof MdimportError ? error.stderr : error.message,
        requiresRoot
      )
    }
    throw error
  }
}

/**
 * List all installed Spotlight importers
 * @returns Array of importer paths
 * @throws {MdimportError} If the command fails
 */
export async function listImporters(): Promise<string[]> {
  try {
    const { stdout, stderr } = await execFileAsync('mdimport', ['-L'])
    if (stderr) {
      throw new MdimportError('Failed to list importers', stderr)
    }
    return stdout
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
  } catch (error) {
    if (error instanceof Error) {
      throw new MdimportError(
        'Failed to list importers',
        error instanceof MdimportError ? error.stderr : error.message
      )
    }
    throw error
  }
}

/**
 * List all available Spotlight attributes and their localizations
 * @returns Array of attribute descriptions
 * @throws {MdimportError} If the command fails
 */
export async function listAttributes(): Promise<string[]> {
  try {
    const { stdout, stderr } = await execFileAsync('mdimport', ['-A'])
    if (stderr) {
      throw new MdimportError('Failed to list attributes', stderr)
    }
    return stdout
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
  } catch (error) {
    if (error instanceof Error) {
      throw new MdimportError(
        'Failed to list attributes',
        error instanceof MdimportError ? error.stderr : error.message
      )
    }
    throw error
  }
}

/**
 * Print the Spotlight schema
 * @returns Schema XML as a string
 * @throws {MdimportError} If the command fails
 */
export async function getSchema(): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync('mdimport', ['-X'])
    if (stderr) {
      throw new MdimportError('Failed to get schema', stderr)
    }
    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      throw new MdimportError(
        'Failed to get schema',
        error instanceof MdimportError ? error.stderr : error.message
      )
    }
    throw error
  }
}

/**
 * Reimport files for UTIs claimed by a specific importer
 * @param importerPath Path to the importer (e.g., /System/Library/Spotlight/Chat.mdimporter)
 * @returns Command output
 * @throws {MdimportError} If the command fails
 */
export async function reimportForImporter(importerPath: string): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync('mdimport', ['-r', importerPath])
    if (stderr) {
      throw new MdimportError('Failed to reimport files', stderr)
    }
    return stdout.trim()
  } catch (error) {
    if (error instanceof Error) {
      const requiresRoot = error.message.includes('Operation not permitted')
      throw new MdimportError(
        'Failed to reimport files',
        error instanceof MdimportError ? error.stderr : error.message,
        requiresRoot
      )
    }
    throw error
  }
}
