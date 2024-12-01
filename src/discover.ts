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
 * Get all available Spotlight attributes for a file
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
 * Get all known content types with descriptions
 */
export const getContentTypes = () => CONTENT_TYPES

/**
 * Get all known Spotlight attributes with descriptions
 */
export const getSpotlightAttributes = () => SPOTLIGHT_ATTRIBUTES

/**
 * Search for attributes by name or description
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
