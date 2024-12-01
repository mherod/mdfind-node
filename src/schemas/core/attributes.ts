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
  'public.item': 'Base type for all items',
  'public.content': 'Base type for all content',
  'public.data': 'Generic data files',
  'public.text': 'Text-based content',
  'public.composite-content': 'Content with multiple parts',

  // Images
  'public.image': 'Image files (JPEG, PNG, etc.)',
  'public.jpeg': 'JPEG Image',
  'public.png': 'PNG Image',
  'public.heic': 'HEIC Image',
  'com.apple.icns': 'Apple Icon Image',

  // Audio/Video
  'public.audio': 'Audio files (MP3, WAV, etc.)',
  'public.movie': 'Video files (MP4, MOV, etc.)',
  'public.audiovisual-content': 'Audio/Visual content',
  'public.mp3': 'MP3 Audio',
  'public.mp4': 'MP4 Video',
  'public.mpeg-4': 'MPEG-4 Media',
  'public.mpeg-2-transport-stream': 'MPEG-2 Transport Stream',
  'com.apple.quicktime-movie': 'QuickTime Movie',

  // Documents
  'public.plain-text': 'Plain text files',
  'public.rtf': 'Rich Text Format documents',
  'public.html': 'HTML documents',
  'public.xml': 'XML documents',
  'public.pdf': 'PDF documents',
  'com.adobe.pdf': 'Adobe PDF Document',
  'net.daringfireball.markdown': 'Markdown Document',

  // Code
  'public.source-code': 'Source Code File',
  'public.shell-script': 'Shell Script',
  'public.swift-source': 'Swift Source File',
  'public.python-script': 'Python Script',
  'public.json': 'JSON File',
  'public.yaml': 'YAML File',

  // Bundles and Packages
  'public.directory': 'Directory/Folder',
  'public.folder': 'Folders/Directories',
  'com.apple.bundle': 'Generic Bundle',
  'com.apple.package': 'macOS Package Bundle',
  'com.apple.application': 'Generic Application',
  'com.apple.application-bundle': 'macOS Application Bundle',
  'com.apple.application-file': 'macOS Application File',
  'com.apple.localizable-name-bundle': 'Bundle with Localizable Name',

  // System
  'public.executable': 'Executable files',
  'com.apple.property-list': 'Property List (plist)',
  'com.apple.systempreference': 'System Preference',
  'com.apple.plugin': 'Plugin Bundle',
  'com.apple.framework': 'Framework Bundle',

  // Archives and Data
  'public.archive': 'Archive files (ZIP, etc.)',
  'public.font': 'Font files',

  // Apple iWork
  'com.apple.keynote.key': 'Keynote Presentation',
  'com.apple.numbers.numbers': 'Numbers Spreadsheet',
  'com.apple.pages.pages': 'Pages Document',

  // Mail
  'com.apple.mail.emlx': 'Apple Mail Message'
} as const

// Common Spotlight attributes with descriptions
export const SPOTLIGHT_ATTRIBUTES: SpotlightAttributeDefinition[] = [
  // General attributes
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
    name: 'kMDItemFSSize',
    description: 'File size in bytes',
    type: 'number',
    example: 1024,
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
    name: 'kMDItemLastUsedDate',
    description: 'When the file was last opened',
    type: 'date',
    category: 'general'
  },
  {
    name: 'kMDItemContentTypeTree',
    description: 'Hierarchy of content types',
    type: 'array',
    example: ['public.image', 'public.jpeg'],
    category: 'general'
  },
  {
    name: 'kMDItemKind',
    description: 'Localized description of the file type',
    type: 'string',
    example: 'JPEG image',
    category: 'general'
  },

  // System attributes
  {
    name: 'kMDItemFSCreatorCode',
    description: 'Classic Mac OS creator code',
    type: 'string',
    category: 'system'
  },
  {
    name: 'kMDItemFSTypeCode',
    description: 'Classic Mac OS type code',
    type: 'string',
    category: 'system'
  },
  {
    name: 'kMDItemFSNodeCount',
    description: 'Number of items in a folder',
    type: 'number',
    category: 'system'
  },
  {
    name: 'kMDItemFSOwnerUserID',
    description: 'User ID of the file owner',
    type: 'number',
    category: 'system'
  },
  {
    name: 'kMDItemFSOwnerGroupID',
    description: 'Group ID of the file owner',
    type: 'number',
    category: 'system'
  },
  {
    name: 'kMDItemFSHasCustomIcon',
    description: 'Whether the file has a custom icon',
    type: 'boolean',
    category: 'system'
  },
  {
    name: 'kMDItemFSIsStationery',
    description: 'Whether the file is a stationery pad',
    type: 'boolean',
    category: 'system'
  },
  {
    name: 'kMDItemFSInvisible',
    description: 'Whether the file is invisible',
    type: 'boolean',
    category: 'system'
  },
  {
    name: 'kMDItemFSLabel',
    description: 'Finder label (0-7)',
    type: 'number',
    category: 'system'
  },

  // Document attributes
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
    name: 'kMDItemTextContent',
    description: 'Searchable text content',
    type: 'string',
    category: 'document'
  },
  {
    name: 'kMDItemEncodingApplications',
    description: 'Applications that created/modified the file',
    type: 'array',
    category: 'document'
  },
  {
    name: 'kMDItemLanguages',
    description: 'Languages used in the content',
    type: 'array',
    example: ['en', 'fr'],
    category: 'document'
  },
  {
    name: 'kMDItemCopyright',
    description: 'Copyright information',
    type: 'string',
    category: 'document'
  },
  {
    name: 'kMDItemNumberOfPages',
    description: 'Number of pages',
    type: 'number',
    category: 'document'
  },

  // Image attributes
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
    name: 'kMDItemColorSpace',
    description: 'Color space of the image',
    type: 'string',
    example: 'RGB',
    category: 'image'
  },
  {
    name: 'kMDItemBitsPerSample',
    description: 'Bits per color sample',
    type: 'number',
    example: 8,
    category: 'image'
  },
  {
    name: 'kMDItemFlashOnOff',
    description: 'Whether flash was used',
    type: 'boolean',
    category: 'image'
  },
  {
    name: 'kMDItemFocalLength',
    description: 'Focal length of the lens (mm)',
    type: 'number',
    category: 'image'
  },
  {
    name: 'kMDItemAcquisitionMake',
    description: 'Camera manufacturer',
    type: 'string',
    category: 'image'
  },
  {
    name: 'kMDItemAcquisitionModel',
    description: 'Camera model',
    type: 'string',
    category: 'image'
  },
  {
    name: 'kMDItemISOSpeed',
    description: 'ISO speed rating',
    type: 'number',
    category: 'image'
  },
  {
    name: 'kMDItemOrientation',
    description: 'Image orientation (1-8)',
    type: 'number',
    category: 'image'
  },
  {
    name: 'kMDItemLayerNames',
    description: 'Names of layers in the image',
    type: 'array',
    category: 'image'
  },

  // Audio attributes
  {
    name: 'kMDItemAudioBitRate',
    description: 'Audio bit rate in bits per second',
    type: 'number',
    example: 320000,
    category: 'audio'
  },
  {
    name: 'kMDItemAudioChannelCount',
    description: 'Number of audio channels',
    type: 'number',
    example: 2,
    category: 'audio'
  },
  {
    name: 'kMDItemAudioSampleRate',
    description: 'Audio sample rate in Hz',
    type: 'number',
    example: 44100,
    category: 'audio'
  },
  {
    name: 'kMDItemMusicalGenre',
    description: 'Musical genre',
    type: 'string',
    category: 'audio'
  },
  {
    name: 'kMDItemRecordingYear',
    description: 'Year the audio was recorded',
    type: 'number',
    category: 'audio'
  },
  {
    name: 'kMDItemComposer',
    description: 'Music composer',
    type: 'string',
    category: 'audio'
  },
  {
    name: 'kMDItemAlbum',
    description: 'Album name',
    type: 'string',
    category: 'audio'
  },
  {
    name: 'kMDItemAudioTrackNumber',
    description: 'Track number in album',
    type: 'number',
    category: 'audio'
  },

  // Location attributes
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
  },
  {
    name: 'kMDItemAltitude',
    description: 'GPS altitude in meters',
    type: 'number',
    category: 'location'
  },
  {
    name: 'kMDItemTimestamp',
    description: 'When the location was recorded',
    type: 'date',
    category: 'location'
  },
  {
    name: 'kMDItemSpeed',
    description: 'Speed in meters per second',
    type: 'number',
    category: 'location'
  },
  {
    name: 'kMDItemGPSTrack',
    description: 'Direction of travel (degrees)',
    type: 'number',
    category: 'location'
  },
  {
    name: 'kMDItemCity',
    description: 'City name',
    type: 'string',
    category: 'location'
  },
  {
    name: 'kMDItemStateOrProvince',
    description: 'State or province name',
    type: 'string',
    category: 'location'
  },
  {
    name: 'kMDItemCountry',
    description: 'Country name',
    type: 'string',
    category: 'location'
  }
]

// Helper function to get attribute definition
export const getAttributeDefinition = (name: string): SpotlightAttributeDefinition | undefined => {
  return SPOTLIGHT_ATTRIBUTES.find(attr => attr.name === name)
}

// Helper function to get attributes by category
export const getAttributesByCategory = (
  category: SpotlightAttributeDefinition['category']
): SpotlightAttributeDefinition[] => {
  return SPOTLIGHT_ATTRIBUTES.filter(attr => attr.category === category)
}

// Helper function to get content type description
export const getContentTypeDescription = (contentType: keyof typeof CONTENT_TYPES): string => {
  return CONTENT_TYPES[contentType]
}
