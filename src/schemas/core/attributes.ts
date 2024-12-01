import { z } from 'zod'

/**
 * Interface for Spotlight attribute definitions.
 * Describes metadata attributes available in Spotlight searches.
 *
 * Properties:
 * - name: Attribute identifier (e.g., 'kMDItemDisplayName')
 * - description: Human-readable description
 * - type: Data type of the attribute value
 * - example: Optional example value
 * - category: Functional category for organization
 *
 * Data types:
 * - string: Text values and identifiers
 * - number: Numeric measurements and counts
 * - date: Timestamps and calendar dates
 * - boolean: True/false flags
 * - array: Lists of values
 *
 * Categories:
 * - general: Basic file properties
 * - document: Document-specific metadata
 * - media: Audio/video properties
 * - image: Image-specific properties
 * - audio: Audio-specific properties
 * - location: Geographic information
 * - system: Operating system metadata
 */
export interface SpotlightAttributeDefinition {
  name: string
  description: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'array'
  example?: string | number | boolean | string[]
  category: 'general' | 'document' | 'media' | 'image' | 'audio' | 'location' | 'system'
}

/**
 * Schema for validating Spotlight attribute definitions.
 * Ensures attribute metadata is correctly formatted.
 *
 * @example
 * Basic attribute:
 * ```typescript
 * const attr = AttributeDefinitionSchema.parse({
 *   name: 'kMDItemDisplayName',
 *   description: 'The display name of the file',
 *   type: 'string',
 *   example: 'example.pdf',
 *   category: 'general'
 * })
 * ```
 *
 * @example
 * Numeric attribute:
 * ```typescript
 * const attr = AttributeDefinitionSchema.parse({
 *   name: 'kMDItemPixelHeight',
 *   description: 'Height of the image in pixels',
 *   type: 'number',
 *   example: 1080,
 *   category: 'image'
 * })
 * ```
 */
export const AttributeDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  type: z.enum(['string', 'number', 'date', 'boolean', 'array']),
  example: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
  category: z.enum(['general', 'document', 'media', 'image', 'audio', 'location', 'system'])
})

/**
 * Common content types with descriptions.
 * Maps Uniform Type Identifiers (UTIs) to human-readable descriptions.
 *
 * Categories:
 * - Images: JPEG, PNG, etc.
 * - Audio: MP3, WAV, etc.
 * - Video: MP4, MOV, etc.
 * - Documents: PDF, text, RTF
 * - Web: HTML, XML
 * - System: Archives, executables
 *
 * @example
 * Using content types:
 * ```typescript
 * console.log(CONTENT_TYPES['public.image'])
 * // Output: "Image files (JPEG, PNG, etc.)"
 *
 * console.log(CONTENT_TYPES['public.audio'])
 * // Output: "Audio files (MP3, WAV, etc.)"
 * ```
 *
 * @example
 * Checking file type:
 * ```typescript
 * const type = 'public.pdf'
 * if (type in CONTENT_TYPES) {
 *   console.log(`File type: ${CONTENT_TYPES[type]}`)
 * }
 * ```
 */
export const CONTENT_TYPES = {
  'public.image': 'Image files (JPEG, PNG, etc.)',
  'public.audio': 'Audio files (MP3, WAV, etc.)',
  'public.movie': 'Video files (MP4, MOV, etc.)',
  'public.pdf': 'PDF documents',
  'public.plain-text': 'Plain text files',
  'public.rtf': 'Rich Text Format documents',
  'public.html': 'HTML documents',
  'public.xml': 'XML documents',
  'public.archive': 'Archive files (ZIP, etc.)',
  'public.data': 'Generic data files',
  'public.folder': 'Folders/Directories',
  'public.executable': 'Executable files',
  'public.font': 'Font files'
} as const

// Common Spotlight attributes with descriptions
export const SPOTLIGHT_ATTRIBUTES: SpotlightAttributeDefinition[] = [
  {
    name: 'kMDItemContentType',
    description: 'The type of content (see CONTENT_TYPES)',
    type: 'string',
    example: 'public.image',
    category: 'general'
  },
  {
    name: 'kMDItemDisplayName',
    description: 'The display name of the file',
    type: 'string',
    example: 'example.jpg',
    category: 'general'
  },
  {
    name: 'kMDItemFSName',
    description: 'The filename on disk',
    type: 'string',
    example: 'example.jpg',
    category: 'general'
  },
  {
    name: 'kMDItemContentCreationDate',
    description: 'When the file was created',
    type: 'date',
    category: 'general'
  },
  {
    name: 'kMDItemContentModificationDate',
    description: 'When the file was last modified',
    type: 'date',
    category: 'general'
  },
  {
    name: 'kMDItemAuthors',
    description: 'Authors of the document',
    type: 'array',
    example: ['John Doe', 'Jane Smith'],
    category: 'document'
  },
  {
    name: 'kMDItemTitle',
    description: 'Title of the document',
    type: 'string',
    example: 'My Document',
    category: 'document'
  },
  {
    name: 'kMDItemKeywords',
    description: 'Keywords/tags associated with the file',
    type: 'array',
    example: ['vacation', 'beach', '2024'],
    category: 'document'
  },
  {
    name: 'kMDItemPixelHeight',
    description: 'Height of the image in pixels',
    type: 'number',
    example: 1080,
    category: 'image'
  },
  {
    name: 'kMDItemPixelWidth',
    description: 'Width of the image in pixels',
    type: 'number',
    example: 1920,
    category: 'image'
  },
  {
    name: 'kMDItemAudioBitRate',
    description: 'Audio bit rate in bits per second',
    type: 'number',
    example: 320000,
    category: 'audio'
  },
  {
    name: 'kMDItemLatitude',
    description: 'GPS latitude where photo/video was taken',
    type: 'number',
    example: 37.7749,
    category: 'location'
  },
  {
    name: 'kMDItemLongitude',
    description: 'GPS longitude where photo/video was taken',
    type: 'number',
    example: -122.4194,
    category: 'location'
  }
]

// Helper function to get attribute definition
export const getAttributeDefinition = (name: string): SpotlightAttributeDefinition | undefined => {
  return SPOTLIGHT_ATTRIBUTES.find(attr => attr.name === name)
}

// Helper function to get attributes by category
export const getAttributesByCategory = (category: SpotlightAttributeDefinition['category']) => {
  return SPOTLIGHT_ATTRIBUTES.filter(attr => attr.category === category)
}

// Helper function to get content type description
export const getContentTypeDescription = (contentType: keyof typeof CONTENT_TYPES) => {
  return CONTENT_TYPES[contentType]
}
