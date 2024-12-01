# Spotlight Attributes Documentation

> Understanding and discovering metadata attributes in Spotlight

## Overview

Spotlight uses metadata attributes to describe file properties. This guide covers:

- Finding available attributes
- Understanding attribute types
- Using attributes in queries
- Common attribute categories
- Attribute discovery tools

## Attribute Basics

Attributes follow a naming convention:

```
kMDItem[Category][Property]

Examples:
kMDItemDisplayName
kMDItemContentType
kMDItemPixelHeight
```

## Discovery Tools

### List Available Attributes

```typescript
import { discover } from 'mdfind-node'

// Get all attributes
const attributes = await discover.attributes()

// Filter by category
const imageAttrs = await discover.attributes({
  forContentType: 'public.image'
})

// Get attribute details
const attr = await discover.attribute('kMDItemPixelHeight')
console.log(attr.description) // 'Height in pixels'
console.log(attr.type) // 'number'
```

### Attribute Search

```typescript
import { discover } from 'mdfind-node'

// Search by keyword
const gpsAttrs = await discover.findAttributes('gps')

// Search by value type
const dateAttrs = await discover.findAttributes({
  type: 'date'
})

// Search by content type
const audioAttrs = await discover.findAttributes({
  forContentType: 'public.audio'
})
```

## Common Categories

### Basic Attributes

```typescript
// File information
kMDItemFSName // File name
kMDItemFSSize // File size
kMDItemDisplayName // Display name
kMDItemPath // File path
kMDItemContentType // UTI type
kMDItemContentTypeTree // Type hierarchy

// Dates
kMDItemContentCreationDate // Creation date
kMDItemContentModificationDate // Modified date
kMDItemLastUsedDate // Last used
kMDItemAttributeChangeDate // Metadata changed
```

### Content Attributes

```typescript
// Text content
kMDItemTextContent // Extracted text
kMDItemTitle // Document title
kMDItemAuthors // Authors
kMDItemComment // Comments
kMDItemCopyright // Copyright
kMDItemKeywords // Keywords/tags
kMDItemSubject // Subject
kMDItemDescription // Description
kMDItemLanguages // Content languages
```

### Media Attributes

```typescript
// Images
kMDItemPixelHeight // Image height
kMDItemPixelWidth // Image width
kMDItemColorSpace // Color space
kMDItemBitsPerSample // Color depth
kMDItemOrientation // Image orientation

// Audio/Video
kMDItemDurationSeconds // Duration
kMDItemCodecs // Media codecs
kMDItemAudioBitRate // Audio quality
kMDItemAudioChannelCount // Channels
kMDItemAudioSampleRate // Sample rate
kMDItemVideoFrameRate // Frame rate
```

### Location Attributes

```typescript
// GPS data
kMDItemGPSLatitude // Latitude
kMDItemGPSLongitude // Longitude
kMDItemGPSAltitude // Altitude
kMDItemGPSDateStamp // GPS timestamp
kMDItemGPSStatus // Fix status

// Other location
kMDItemCity // City name
kMDItemStateOrProvince // State/province
kMDItemCountry // Country
```

### Device Attributes

```typescript
// Camera information
kMDItemAcquisitionMake // Device maker
kMDItemAcquisitionModel // Device model
kMDItemExposureTime // Exposure time
kMDItemFNumber // Aperture
kMDItemISOSpeed // ISO speed
kMDItemFocalLength // Focal length

// Software
kMDItemCreator // Creating app
kMDItemEncodingApplications // Encoding software
```

## Using Attributes

### In Queries

```typescript
import { QueryBuilder } from 'mdfind-node'

// Basic attribute query
const query = new QueryBuilder().attribute('kMDItemPixelHeight', 1080).execute()

// Range query
const range = new QueryBuilder().attributeGreaterThan('kMDItemDurationSeconds', 300).execute()

// Multiple attributes
const complex = new QueryBuilder()
  .attribute('kMDItemContentType', 'public.image')
  .attributeGreaterThan('kMDItemPixelHeight', 1080)
  .attributeExists('kMDItemGPSLatitude')
  .execute()
```

### In Metadata Extraction

```typescript
import { mdls } from 'mdfind-node'

// Get specific attributes
const metadata = await mdls('file.jpg', {
  attributes: ['kMDItemPixelHeight', 'kMDItemPixelWidth', 'kMDItemGPSLatitude']
})

// Access raw values
console.log(metadata.raw.kMDItemPixelHeight)
```

## Attribute Types

### Common Types

- `string` - Text values
- `number` - Numeric values
- `date` - Date/time values
- `boolean` - True/false values
- `array` - Lists of values
- `object` - Structured data

### Type Mapping

```typescript
// String attributes
kMDItemDisplayName: string
kMDItemContentType: string
kMDItemTitle: string

// Number attributes
kMDItemFSSize: number
kMDItemPixelHeight: number
kMDItemDurationSeconds: number

// Date attributes
kMDItemContentCreationDate: Date
kMDItemContentModificationDate: Date

// Boolean attributes
kMDItemHasAlphaChannel: boolean
kMDItemIsEncrypted: boolean

// Array attributes
kMDItemKeywords: string[]
kMDItemAuthors: string[]
kMDItemLanguages: string[]

// Object attributes
kMDItemContentTypeTree: string[]
kMDItemWhereFroms: string[]
```

## Best Practices

1. Verify attribute existence before use
2. Handle missing values gracefully
3. Use type-specific methods when available
4. Consider performance with many attributes
5. Cache attribute metadata for reuse

## Examples

### Image Analysis

```typescript
import { discover, QueryBuilder } from 'mdfind-node'

async function analyzeImages() {
  // Get image-specific attributes
  const attrs = await discover.attributes({
    forContentType: 'public.image'
  })

  // Build query
  const query = new QueryBuilder().contentType('public.image')

  // Add attribute conditions
  for (const attr of attrs) {
    if (attr.type === 'number') {
      query.attributeExists(attr.name)
    }
  }

  // Find images with rich metadata
  const images = await query.execute()
  return images
}
```

### Document Indexing

```typescript
import { mdls, discover } from 'mdfind-node'

async function indexDocument(path: string) {
  // Get text document attributes
  const attrs = await discover.attributes({
    forContentType: 'public.text'
  })

  // Extract metadata
  const metadata = await mdls(path, {
    attributes: attrs.map(a => a.name)
  })

  // Build index
  const index = {
    content: metadata.raw.kMDItemTextContent,
    title: metadata.raw.kMDItemTitle,
    author: metadata.raw.kMDItemAuthors?.[0],
    modified: metadata.raw.kMDItemContentModificationDate,
    language: metadata.raw.kMDItemLanguages?.[0]
  }

  return index
}
```

## See Also

- [Query Builder Documentation](./query-builder.md) - Using attributes in searches
- [Extended Metadata](./metadata.md) - Working with metadata types
- [Content Types](./content-types.md) - Understanding file types

## References

- [Spotlight Metadata Attributes Reference](https://developer.apple.com/library/archive/documentation/CoreServices/Reference/MetadataAttributesRef/Reference/CommonAttrs.html)
- [File Metadata Programming Guide](https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/FileSystemProgrammingGuide/FileMetadata/FileMetadata.html)
