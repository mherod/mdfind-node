import { mdfind } from './mdfind.js'
import type { MdfindOptionsInput } from './schemas/index.js'

export interface BatchSearchOptions extends MdfindOptionsInput {
  query: string
}

const DEFAULT_BATCH_OPTIONS: MdfindOptionsInput = {
  live: false,
  count: false,
  nullSeparator: false,
  maxBuffer: 1024 * 1024,
  reprint: false,
  literal: false,
  interpret: false,
  names: [],
  attributes: [],
  onlyInDirectory: undefined,
  smartFolder: undefined
}

/**
 * Run multiple mdfind queries in parallel.
 * Each query can have its own options.
 *
 * @param {BatchSearchOptions[]} searches - Array of search queries and options
 * @returns {Promise<string[][]>} Array of results for each query
 *
 * @example
 * ```typescript
 * const results = await batchSearch([
 *   { query: 'kind:image', options: { onlyIn: '~/Pictures' } },
 *   { query: 'kind:pdf', options: { onlyIn: '~/Documents' } }
 * ])
 * ```
 */
export async function batchSearch(
  searches: { query: string; options?: MdfindOptionsInput }[]
): Promise<string[][]> {
  const results = await Promise.all(
    searches.map(({ query, options = {} }) =>
      mdfind(query, {
        ...DEFAULT_BATCH_OPTIONS,
        ...options
      })
    )
  )
  return results
}

/**
 * Run multiple mdfind queries sequentially.
 * Each query can have its own options.
 *
 * @param {BatchSearchOptions[]} searches - Array of search queries and options
 * @returns {Promise<string[][]>} Array of results for each query
 *
 * @example
 * ```typescript
 * const results = await batchSearchSequential([
 *   { query: 'kind:image', options: { onlyIn: '~/Pictures' } },
 *   { query: 'kind:pdf', options: { onlyIn: '~/Documents' } }
 * ])
 * ```
 */
export async function batchSearchSequential(
  searches: { query: string; options?: MdfindOptionsInput }[]
): Promise<string[][]> {
  const results: string[][] = []
  for (const { query, options = {} } of searches) {
    const result = await mdfind(query, {
      ...DEFAULT_BATCH_OPTIONS,
      ...options
    })
    results.push(result)
  }
  return results
}
