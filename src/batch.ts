import { mdfind } from './mdfind.js'
import { SpotlightAttributeSchema, type MdfindOptions } from './schemas/index.js'
import { z } from 'zod'

/**
 * Configuration options for a batch search operation.
 * Extends MdfindOptions but excludes the 'live' option since batch operations
 * are always one-time searches.
 *
 * @property {string} query - The Spotlight query to execute
 * @property {string} [onlyIn] - Limit search to a specific directory
 * @property {string} [name] - Search by filename pattern
 * @property {boolean} [count] - Return only the count of matches
 * @property {string} [attr] - Return specific metadata attributes
 * @property {string} [smartFolder] - Use a saved search
 * @property {boolean} [nullSeparator] - Use null character as separator
 * @property {number} [maxBuffer] - Maximum buffer size for results
 * @property {boolean} [literal] - Disable special query interpretation
 * @property {boolean} [interpret] - Enable natural language interpretation
 */
export interface BatchSearchOptions extends Omit<MdfindOptions, 'live'> {
  query: string
}

/**
 * Schema for validating batch search options.
 * Provides runtime type checking and default values.
 *
 * @internal
 */
export const BatchSearchOptionsSchema = z
  .object({
    query: z.string(),
    onlyIn: z.string().optional(),
    name: z.string().optional(),
    count: z.boolean().optional(),
    attr: SpotlightAttributeSchema.optional(),
    smartFolder: z.string().optional(),
    nullSeparator: z.boolean().optional(),
    maxBuffer: z.number().optional(),
    literal: z.boolean().optional(),
    interpret: z.boolean().optional()
  })
  .strict()
  .transform(opts => ({
    count: false,
    nullSeparator: false,
    maxBuffer: 1024 * 512,
    literal: false,
    interpret: false,
    ...opts
  }))

/**
 * Result of a batch search operation.
 * Contains both the search configuration and its results.
 *
 * @property {string} query - The Spotlight query that was executed
 * @property {BatchSearchOptions} options - The options used for the search
 * @property {string[]} results - Array of file paths matching the query
 * @property {Error} [error] - Error object if the search failed
 */
export interface BatchSearchResult {
  query: string
  options: BatchSearchOptions
  results: string[]
  error?: Error
}

/**
 * Run multiple Spotlight searches in parallel.
 * This is useful for performing several different searches efficiently.
 * Each search runs independently and can have its own configuration.
 *
 * @param {BatchSearchOptions[]} searches - Array of search configurations
 * @returns {Promise<BatchSearchResult[]>} Results for each search, in the same order
 * @throws {Error} If validation fails for any search options
 *
 * @example
 * Search for different file types:
 * ```typescript
 * const results = await mdfindBatch([
 *   {
 *     query: 'kMDItemContentType == "public.image"',
 *     onlyIn: '~/Pictures',
 *     attr: 'kMDItemPixelHeight'
 *   },
 *   {
 *     query: 'kMDItemContentType == "public.audio"',
 *     onlyIn: '~/Music',
 *     attr: 'kMDItemDurationSeconds'
 *   }
 * ])
 *
 * for (const result of results) {
 *   if (result.error) {
 *     console.error(`Search failed: ${result.error.message}`)
 *     continue
 *   }
 *   console.log(`Found ${result.results.length} files for ${result.query}`)
 * }
 * ```
 *
 * @example
 * Search with different criteria:
 * ```typescript
 * const results = await mdfindBatch([
 *   {
 *     query: 'created:today',
 *     interpret: true
 *   },
 *   {
 *     query: 'modified:yesterday',
 *     interpret: true
 *   },
 *   {
 *     query: 'tag:important',
 *     interpret: true
 *   }
 * ])
 * ```
 */
export const mdfindBatch = async (searches: BatchSearchOptions[]): Promise<BatchSearchResult[]> => {
  const validatedSearches = searches.map(search => BatchSearchOptionsSchema.parse(search))

  const searchPromises = validatedSearches.map(async (search): Promise<BatchSearchResult> => {
    try {
      const { query, ...options } = search
      const results = await mdfind(query, options)
      return {
        query,
        options: search,
        results
      }
    } catch (error) {
      return {
        query: search.query,
        options: search,
        results: [],
        error: error instanceof Error ? error : new Error('Unknown error')
      }
    }
  })

  return Promise.all(searchPromises)
}

/**
 * Run multiple Spotlight searches in sequence.
 * This is useful when you want to control system load or need results in order.
 * Each search starts only after the previous one completes.
 *
 * @param {BatchSearchOptions[]} searches - Array of search configurations
 * @returns {Promise<BatchSearchResult[]>} Results for each search, in the same order
 * @throws {Error} If validation fails for any search options
 *
 * @example
 * Search with dependencies:
 * ```typescript
 * const results = await mdfindSequential([
 *   // First find all PDFs
 *   {
 *     query: 'kind:pdf',
 *     interpret: true
 *   },
 *   // Then find recent documents
 *   {
 *     query: 'kind:document modified:today',
 *     interpret: true
 *   },
 *   // Finally find large files
 *   {
 *     query: 'size:>1MB',
 *     interpret: true
 *   }
 * ])
 *
 * // Results are in the same order as the searches
 * for (const [index, result] of results.entries()) {
 *   console.log(`Search ${index + 1}:`, result.results.length)
 * }
 * ```
 *
 * @example
 * Search with error handling:
 * ```typescript
 * const results = await mdfindSequential([
 *   {
 *     query: 'author:"John Doe"',
 *     literal: true
 *   },
 *   {
 *     query: 'modified:today',
 *     interpret: true
 *   }
 * ])
 *
 * for (const result of results) {
 *   if (result.error) {
 *     console.error(`Search "${result.query}" failed:`, result.error)
 *     continue
 *   }
 *   console.log(`Search "${result.query}" found:`, result.results)
 * }
 * ```
 */
export const mdfindSequential = async (
  searches: BatchSearchOptions[]
): Promise<BatchSearchResult[]> => {
  const validatedSearches = searches.map(search => BatchSearchOptionsSchema.parse(search))
  const results: BatchSearchResult[] = []

  for (const search of validatedSearches) {
    try {
      const { query, ...options } = search
      const searchResults = await mdfind(query, options)
      results.push({
        query,
        options: search,
        results: searchResults
      })
    } catch (error) {
      results.push({
        query: search.query,
        options: search,
        results: [],
        error: error instanceof Error ? error : new Error('Unknown error')
      })
    }
  }

  return results
}

/**
 * Run the same Spotlight search across multiple directories in parallel.
 * This is useful for searching across different locations with the same criteria.
 * Each directory is searched independently and concurrently.
 *
 * @param {string} query - The Spotlight query to execute
 * @param {string[]} directories - Array of directories to search in
 * @param {Omit<MdfindOptions, 'onlyIn'>} [options] - Additional search options
 * @returns {Promise<BatchSearchResult[]>} Results for each directory
 * @throws {Error} If validation fails for the search options
 *
 * @example
 * Search across user directories:
 * ```typescript
 * const results = await mdfindMultiDirectory(
 *   'kMDItemContentType == "public.image"',
 *   [
 *     '~/Pictures',
 *     '~/Documents',
 *     '~/Downloads'
 *   ],
 *   {
 *     attr: 'kMDItemPixelHeight'
 *   }
 * )
 *
 * for (const result of results) {
 *   console.log(`Found in ${result.options.onlyIn}:`, result.results.length)
 * }
 * ```
 *
 * @example
 * Search with natural language:
 * ```typescript
 * const results = await mdfindMultiDirectory(
 *   'images created today',
 *   ['~/Desktop', '~/Documents'],
 *   { interpret: true }
 * )
 * ```
 */
export const mdfindMultiDirectory = async (
  query: string,
  directories: string[],
  options: Omit<MdfindOptions, 'onlyIn'> = {}
): Promise<BatchSearchResult[]> => {
  const searches = directories.map(dir => ({
    query,
    ...options,
    onlyIn: dir
  }))

  return mdfindBatch(searches)
}

/**
 * Run multiple Spotlight queries against the same directory in parallel.
 * This is useful for searching with different criteria in the same location.
 * Each query runs independently and concurrently.
 *
 * @param {string[]} queries - Array of Spotlight queries to execute
 * @param {string} [directory] - Optional directory to limit the search to
 * @param {Omit<MdfindOptions, 'onlyIn'>} [options] - Additional search options
 * @returns {Promise<BatchSearchResult[]>} Results for each query
 * @throws {Error} If validation fails for the search options
 *
 * @example
 * Search for different file types:
 * ```typescript
 * const results = await mdfindMultiQuery(
 *   [
 *     'kMDItemContentType == "public.image"',
 *     'kMDItemContentType == "public.audio"',
 *     'kMDItemContentType == "public.movie"'
 *   ],
 *   '~/Downloads'
 * )
 *
 * for (const result of results) {
 *   console.log(`Found ${result.results.length} files for ${result.query}`)
 * }
 * ```
 *
 * @example
 * Search with different time ranges:
 * ```typescript
 * const results = await mdfindMultiQuery(
 *   [
 *     'created:today',
 *     'created:yesterday',
 *     'created:lastweek'
 *   ],
 *   '~/Documents',
 *   { interpret: true }
 * )
 * ```
 */
export const mdfindMultiQuery = async (
  queries: string[],
  directory?: string,
  options: Omit<MdfindOptions, 'onlyIn'> = {}
): Promise<BatchSearchResult[]> => {
  const searches = queries.map(query => ({
    query,
    ...options,
    ...(directory && { onlyIn: directory })
  }))

  return mdfindBatch(searches)
}
