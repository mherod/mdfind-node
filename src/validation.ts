import type { MdfindOptionsInput } from './schemas/options.js'

/**
 * Validate search options for compatibility.
 * Throws if incompatible options are provided.
 *
 * @internal
 */
export const validateInput = (query: string, options: MdfindOptionsInput): void => {
  if (options.live && options.count) {
    throw new Error('Cannot use live and count options together')
  }

  if (options.literal && options.interpret) {
    throw new Error('Cannot use literal and interpret options together')
  }

  if (options.timeout !== undefined && !options.live) {
    throw new Error('Timeout option can only be used with live searches')
  }

  const hasNameOption = Boolean(options.name) || (options.names?.length ?? 0) > 0
  if (hasNameOption && !query.trim()) {
    // When using -name, query is optional
    return
  }

  if (!query.trim()) {
    throw new Error('Query cannot be empty unless using -name option')
  }
}
