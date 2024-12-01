import { mdfind } from './mdfind.js'
import { SpotlightAttributeSchema, type MdfindOptions } from './schemas/index.js'
import { z } from 'zod'

export interface BatchSearchOptions extends Omit<MdfindOptions, 'live'> {
  query: string
}

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

export interface BatchSearchResult {
  query: string
  options: BatchSearchOptions
  results: string[]
  error?: Error
}

/**
 * Run multiple Spotlight searches in parallel.
 * This is useful when you need to perform several different searches efficiently.
 *
 * @param {BatchSearchOptions[]} searches - Array of search configurations
 * @returns {Promise<BatchSearchResult[]>} Results for each search
 * @throws {Error} If validation fails for any search options
 *
 * @example
 * ```typescript
 * const results = await mdfindBatch([
 *   {
 *     query: 'kMDItemContentType == "public.image"',
 *     onlyIn: '~/Pictures'
 *   },
 *   {
 *     query: 'kMDItemContentType == "public.audio"',
 *     onlyIn: '~/Music'
 *   }
 * ])
 *
 * for (const result of results) {
 *   console.log(`Found ${result.results.length} files for ${result.query}`)
 * }
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
 *
 * @param {BatchSearchOptions[]} searches - Array of search configurations
 * @returns {Promise<BatchSearchResult[]>} Results for each search
 * @throws {Error} If validation fails for any search options
 *
 * @example
 * ```typescript
 * const results = await mdfindSequential([
 *   {
 *     query: 'kMDItemContentType == "public.image"',
 *     onlyIn: '~/Pictures'
 *   },
 *   {
 *     query: 'kMDItemContentType == "public.audio"',
 *     onlyIn: '~/Music'
 *   }
 * ])
 *
 * // Results are in the same order as the searches
 * for (const result of results) {
 *   console.log(`Found ${result.results.length} files for ${result.query}`)
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
 *
 * @param {string} query - The Spotlight query to execute
 * @param {string[]} directories - Array of directories to search in
 * @param {Omit<MdfindOptions, 'onlyIn'>} [options] - Additional search options
 * @returns {Promise<BatchSearchResult[]>} Results for each directory
 * @throws {Error} If validation fails for the search options
 *
 * @example
 * ```typescript
 * const results = await mdfindMultiDirectory(
 *   'kMDItemContentType == "public.image"',
 *   ['~/Pictures', '~/Documents', '~/Downloads']
 * )
 *
 * for (const result of results) {
 *   console.log(`Found ${result.results.length} images in ${result.options.onlyIn}`)
 * }
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
 *
 * @param {string[]} queries - Array of Spotlight queries to execute
 * @param {string} [directory] - Optional directory to limit the search to
 * @param {Omit<MdfindOptions, 'onlyIn'>} [options] - Additional search options
 * @returns {Promise<BatchSearchResult[]>} Results for each query
 * @throws {Error} If validation fails for the search options
 *
 * @example
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
