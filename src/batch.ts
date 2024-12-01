import { mdfind, type MdfindOptions } from './mdfind.js'
import { z } from 'zod'

export interface BatchSearchOptions extends MdfindOptions {
  query: string
}

export const BatchSearchOptionsSchema = z
  .object({
    query: z.string(),
    onlyIn: z.string().optional(),
    name: z.string().optional(),
    live: z.literal(false).optional(), // Live search not supported in batch mode
    count: z.boolean().optional(),
    attr: z.string().optional(),
    smartFolder: z.string().optional(),
    nullSeparator: z.boolean().optional(),
    maxBuffer: z.number().optional(),
    reprint: z.literal(false).optional(), // Reprint not supported in batch mode
    literal: z.boolean().optional(),
    interpret: z.boolean().optional()
  })
  .strict()

export interface BatchSearchResult {
  query: string
  options: BatchSearchOptions
  results: string[]
  error?: Error
}

/**
 * Run multiple searches in parallel
 */
export const mdfindBatch = async (searches: BatchSearchOptions[]): Promise<BatchSearchResult[]> => {
  const validatedSearches = searches.map(search => BatchSearchOptionsSchema.parse(search))

  const searchPromises = validatedSearches.map(async (search): Promise<BatchSearchResult> => {
    try {
      const results = await mdfind(search.query, search)
      return {
        query: search.query,
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
 * Run multiple searches in sequence
 */
export const mdfindSequential = async (
  searches: BatchSearchOptions[]
): Promise<BatchSearchResult[]> => {
  const validatedSearches = searches.map(search => BatchSearchOptionsSchema.parse(search))
  const results: BatchSearchResult[] = []

  for (const search of validatedSearches) {
    try {
      const searchResults = await mdfind(search.query, search)
      results.push({
        query: search.query,
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
 * Run the same search across multiple directories in parallel
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
 * Run multiple queries against the same directory in parallel
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
