import { execSync } from 'node:child_process'
import {
  CONTENT_TYPES,
  SPOTLIGHT_ATTRIBUTES,
  type SpotlightAttributeDefinition,
  getAttributeDefinition,
  getAttributesByCategory,
  getContentTypeDescription
} from './schemas/core/attributes.js'

/**
 * Get all available Spotlight attributes for a file using mdimport.
 * This function uses the macOS mdimport command to discover all attributes
 * that are available for a specific file.
 *
 * @param {string} filePath - The path to the file to analyze
 * @returns {Record<string, string>} A map of attribute names to their descriptions
 * @throws {Error} If the mdimport command fails or the file cannot be accessed
 *
 * @example
 * ```typescript
 * const attributes = discoverAttributes('path/to/file.jpg')
 * console.log(attributes.kMDItemPixelHeight) // "Height of the image in pixels"
 * ```
 */
export const discoverAttributes = (filePath: string): Record<string, string> => {
  try {
    const output = execSync(`mdimport -A "${filePath}"`, { encoding: 'utf8' })
    const attributes: Record<string, string> = {}

    output.split('\n').forEach(line => {
      const match = line.match(/^\s*([kMD]\w+)\s*=\s*(.+)$/)
      if (match) {
        const [, name, description] = match
        attributes[name] = description.trim()
      }
    })

    return attributes
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to discover attributes: ${error.message}`)
    }
    throw error
  }
}

/**
 * Get all known content types with their descriptions.
 * Returns a map of content type identifiers to human-readable descriptions.
 *
 * @returns {typeof CONTENT_TYPES} A map of content types to their descriptions
 *
 * @example
 * ```typescript
 * const types = getContentTypes()
 * console.log(types['public.image']) // "Image files (JPEG, PNG, etc.)"
 * ```
 */
export const getContentTypes = () => CONTENT_TYPES

/**
 * Get all known Spotlight attributes with their descriptions and metadata.
 * Returns an array of attribute definitions including type information,
 * descriptions, examples, and categories.
 *
 * @returns {SpotlightAttributeDefinition[]} Array of attribute definitions
 *
 * @example
 * ```typescript
 * const attrs = getSpotlightAttributes()
 * const imageAttrs = attrs.filter(a => a.category === 'image')
 * ```
 */
export const getSpotlightAttributes = () => SPOTLIGHT_ATTRIBUTES

/**
 * Search for attributes by name or description.
 * Performs a case-insensitive search across attribute names and descriptions.
 *
 * @param {string} query - The search query
 * @returns {SpotlightAttributeDefinition[]} Array of matching attribute definitions
 *
 * @example
 * ```typescript
 * const imageAttrs = searchAttributes('image')
 * const dateAttrs = searchAttributes('creation date')
 * ```
 */
export const searchAttributes = (query: string): SpotlightAttributeDefinition[] => {
  const lowerQuery = query.toLowerCase()
  return SPOTLIGHT_ATTRIBUTES.filter(
    attr =>
      attr.name.toLowerCase().includes(lowerQuery) ||
      attr.description.toLowerCase().includes(lowerQuery)
  )
}

export {
  type SpotlightAttributeDefinition,
  getAttributeDefinition,
  getAttributesByCategory,
  getContentTypeDescription
}
