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
    /**
     * Test import without storing in index
     * When true, the import is simulated and attributes are returned without modifying the index
     * @default false
     */
    test: z.boolean().default(false),

    /**
     * Debug level (requires test mode)
     * - 1: Print summary of test import
     * - 2: Print summary and all attributes (except kMDItemTextContent)
     * - 3: Print summary and all attributes (including kMDItemTextContent)
     */
    debugLevel: z.enum(['1', '2', '3']).optional(),

    /**
     * Output file for test results (requires test mode)
     */
    outputFile: z.string().optional(),

    /**
     * Show performance information (requires test mode)
     * @default false
     */
    showPerformance: z.boolean().default(false),

    /**
     * Maximum buffer size for output
     * @default 512KB
     */
    maxBuffer: z.number().default(1024 * 512),

    /**
     * Force immediate indexing
     * Note: This is the default behavior if no other flags are specified
     * @default true
     */
    immediate: z.boolean().default(true),

    /**
     * Recursively import directories
     * Note: This is always true for directory imports
     * @default true
     */
    recursive: z.boolean().default(true)
  })
  .strict()
  .refine(
    data => {
      // If not in test mode, these options shouldn't be used
      if (!data.test) {
        return !data.debugLevel && !data.outputFile && !data.showPerformance
      }
      return true
    },
    {
      message: 'Debug level, output file, and performance options require test mode (-t)'
    }
  )

export type MdimportOptions = z.input<typeof MdimportOptionsSchema>

/**
 * Import files or directories into the Spotlight index
 * @param paths Files or directories to import
 * @param options Import options
 * @returns The command output as a string
 * @throws {MdimportError} If the import fails
 *
 * @example
 * Import a file:
 * ```typescript
 * await mdimport('document.pdf')
 * ```
 *
 * @example
 * Test import with debug info:
 * ```typescript
 * await mdimport('document.pdf', {
 *   test: true,
 *   debugLevel: '2'
 * })
 * ```
 *
 * @example
 * Recursive directory import:
 * ```typescript
 * await mdimport('~/Documents')
 * ```
 */
export async function mdimport(
  paths: string | string[],
  options: MdimportOptions = {}
): Promise<string> {
  const opts = MdimportOptionsSchema.parse(options)
  const args: string[] = []

  // Handle test mode and its dependent options
  if (opts.test) {
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
  // Handle immediate mode (default if no other flags)
  else if (opts.immediate) {
    args.push('-i')
  }

  const pathArray = Array.isArray(paths) ? paths : [paths]
  args.push(...pathArray)

  try {
    const { stdout, stderr } = await execFileAsync('mdimport', args, {
      maxBuffer: opts.maxBuffer
    })

    // Some stderr output is informational (like locale loading)
    const isError = stderr !== '' && !stderr.includes('Loading keywords')
    if (isError) {
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
 *
 * @example
 * ```typescript
 * const importers = await listImporters()
 * console.log('Found importers:', importers)
 * ```
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
 *
 * @example
 * ```typescript
 * const attributes = await listAttributes()
 * console.log('Available attributes:', attributes)
 * ```
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
 *
 * @example
 * ```typescript
 * const schema = await getSchema()
 * console.log('Spotlight schema:', schema)
 * ```
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
 *
 * @example
 * ```typescript
 * await reimportForImporter('/System/Library/Spotlight/Chat.mdimporter')
 * ```
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
