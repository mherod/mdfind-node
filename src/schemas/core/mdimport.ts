import { z } from 'zod'

/**
 * Schema for mdimport debug levels
 */
export const MdimportDebugLevelSchema = z.enum(['1', '2', '3'])

/**
 * Schema for mdimport options
 */
export const MdimportOptionsSchema = z
  .object({
    /**
     * Test import without storing in index
     * @default false
     */
    test: z.boolean().default(false),

    /**
     * Debug level (requires test mode)
     * - 1: Print summary of test import
     * - 2: Print summary and all attributes (except kMDItemTextContent)
     * - 3: Print summary and all attributes (including kMDItemTextContent)
     */
    debugLevel: MdimportDebugLevelSchema.optional(),

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
    maxBuffer: z.number().default(1024 * 512)
  })
  .strict()

/**
 * Schema for mdimport results
 */
export const MdimportResultSchema = z.object({
  /**
   * Raw output from mdimport command
   */
  output: z.string(),

  /**
   * Performance metrics (only available with showPerformance option)
   */
  performance: z
    .object({
      totalTime: z.number(),
      importTime: z.number(),
      fileCount: z.number()
    })
    .optional(),

  /**
   * Debug information (only available with debugLevel option)
   */
  debug: z
    .object({
      level: MdimportDebugLevelSchema,
      summary: z.string(),
      attributes: z.record(z.string(), z.unknown()).optional()
    })
    .optional()
})

export type MdimportDebugLevel = z.infer<typeof MdimportDebugLevelSchema>
export type MdimportOptions = z.infer<typeof MdimportOptionsSchema>
export type MdimportResult = z.infer<typeof MdimportResultSchema>

/**
 * Schema for Spotlight importer information
 */
export const ImporterInfoSchema = z.object({
  /**
   * Path to the importer bundle
   */
  path: z.string(),

  /**
   * Name of the importer
   */
  name: z.string(),

  /**
   * Version of the importer
   */
  version: z.string().optional(),

  /**
   * UTIs handled by this importer
   */
  supportedTypes: z.array(z.string()).optional()
})

export type ImporterInfo = z.infer<typeof ImporterInfoSchema>

/**
 * Schema for attribute information
 */
export const AttributeInfoSchema = z.object({
  /**
   * Attribute name (e.g., kMDItemDisplayName)
   */
  name: z.string(),

  /**
   * Localized description
   */
  description: z.string(),

  /**
   * Attribute type (e.g., string, date, number)
   */
  type: z.string().optional(),

  /**
   * Whether the attribute is localized
   */
  isLocalized: z.boolean().optional()
})

export type AttributeInfo = z.infer<typeof AttributeInfoSchema>
