import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { z } from 'zod'

const execFileAsync = promisify(execFile)

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
    maxBuffer: z.number().default(1024 * 512)
  })
  .strict()

export type MdimportOptions = z.input<typeof MdimportOptionsSchema>

/**
 * Import files or directories into the Spotlight index
 * @param paths Files or directories to import
 * @param options Import options
 * @returns The command output as a string
 */
export async function mdimport(
  paths: string | string[],
  options: MdimportOptions = {}
): Promise<string> {
  const opts = MdimportOptionsSchema.parse(options)
  const args: string[] = []

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

  const pathArray = Array.isArray(paths) ? paths : [paths]
  args.push(...pathArray)

  const { stdout } = await execFileAsync('mdimport', args, {
    maxBuffer: opts.maxBuffer
  })

  return stdout.trim()
}

/**
 * List all installed Spotlight importers
 */
export async function listImporters(): Promise<string[]> {
  const { stdout } = await execFileAsync('mdimport', ['-L'])
  return stdout
    .trim()
    .split('\n')
    .filter(line => line.length > 0)
}

/**
 * List all available Spotlight attributes and their localizations
 */
export async function listAttributes(): Promise<string[]> {
  const { stdout } = await execFileAsync('mdimport', ['-A'])
  return stdout
    .trim()
    .split('\n')
    .filter(line => line.length > 0)
}

/**
 * Print the Spotlight schema
 */
export async function getSchema(): Promise<string> {
  const { stdout } = await execFileAsync('mdimport', ['-X'])
  return stdout.trim()
}

/**
 * Reimport files for UTIs claimed by a specific importer
 * @param importerPath Path to the importer (e.g., /System/Library/Spotlight/Chat.mdimporter)
 */
export async function reimportForImporter(importerPath: string): Promise<string> {
  const { stdout } = await execFileAsync('mdimport', ['-r', importerPath])
  return stdout.trim()
}
