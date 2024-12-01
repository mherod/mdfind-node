import type { MdfindOptionsInput } from './schemas/index.js'
import { batchSearch } from './batch.js'

/**
 * Run the same Spotlight search across multiple directories in parallel.
 * This is useful for searching across different locations with the same criteria.
 *
 * @param {string} query - The Spotlight query to execute
 * @param {string[]} directories - Array of directories to search in
 * @param {MdfindOptionsInput} [options] - Additional search options
 * @returns {Promise<string[][]>} Results for each directory
 *
 * @example
 * ```typescript
 * const results = await mdfindMultiDirectory(
 *   'kind:image',
 *   ['~/Pictures', '~/Documents'],
 *   { attributes: ['kMDItemPixelHeight'] }
 * )
 * ```
 */
export function mdfindMultiDirectory(
  query: string,
  directories: string[],
  options: Omit<MdfindOptionsInput, 'onlyInDirectory'> = {}
): Promise<string[][]> {
  const searches = directories.map(dir => ({
    query,
    options: { ...options, onlyInDirectory: dir }
  }))
  return batchSearch(searches)
}

/**
 * Run multiple Spotlight queries against the same directory in parallel.
 * This is useful for searching with different criteria in the same location.
 *
 * @param {string[]} queries - Array of Spotlight queries to execute
 * @param {string} directory - Directory to limit the search to
 * @param {MdfindOptionsInput} [options] - Additional search options
 * @returns {Promise<string[][]>} Results for each query
 *
 * @example
 * ```typescript
 * const results = await mdfindMultiQuery(
 *   [
 *     'kind:image',
 *     'kind:audio',
 *     'kind:movie'
 *   ],
 *   '~/Downloads'
 * )
 * ```
 */
export function mdfindMultiQuery(
  queries: string[],
  directory: string,
  options: Omit<MdfindOptionsInput, 'onlyInDirectory'> = {}
): Promise<string[][]> {
  const searches = queries.map(query => ({
    query,
    options: { ...options, onlyInDirectory: directory }
  }))
  return batchSearch(searches)
}
