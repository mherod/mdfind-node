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
import { getMetadata } from 'mdfind-node'

// Get specific attributes with structured output
const metadata = await getMetadata('file.jpg', {
  attributes: ['kMDItemPixelHeight', 'kMDItemPixelWidth', 'kMDItemGPSLatitude'],
  structured: true
})

// Access through spotlight property
console.log(metadata.spotlight.kMDItemPixelHeight)

// Or use specialized functions for common attributes
import { getBasicMetadata, getExifData, getXMPData } from 'mdfind-node'

// Get basic file metadata
const basic = await getBasicMetadata('file.jpg')
console.log(basic.name, basic.size)

// Get EXIF data for images
const exif = await getExifData('file.jpg')
console.log(exif.make, exif.model)

// Get XMP metadata
const xmp = await getXMPData('file.jpg')
console.log(xmp.title, xmp.creator)
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
// Through spotlight property
metadata.spotlight.kMDItemDisplayName: string
metadata.spotlight.kMDItemContentType: string
metadata.spotlight.kMDItemTitle: string

// Through basic metadata
metadata.basic.name: string
metadata.basic.contentType: string
metadata.basic.size: number

// Through EXIF data
metadata.exif?.make: string
metadata.exif?.model: string
metadata.exif?.focalLength: number

// Through XMP data
metadata.xmp?.title: string
metadata.xmp?.creator: string
metadata.xmp?.subject: string[]

// Raw spotlight attributes
metadata.spotlight.kMDItemFSSize: number
metadata.spotlight.kMDItemPixelHeight: number
metadata.spotlight.kMDItemDurationSeconds: number

metadata.spotlight.kMDItemContentCreationDate: Date
metadata.spotlight.kMDItemContentModificationDate: Date

metadata.spotlight.kMDItemHasAlphaChannel: boolean
metadata.spotlight.kMDItemIsEncrypted: boolean

metadata.spotlight.kMDItemKeywords: string[]
metadata.spotlight.kMDItemAuthors: string[]
metadata.spotlight.kMDItemLanguages: string[]

metadata.spotlight.kMDItemContentTypeTree: string[]
metadata.spotlight.kMDItemWhereFroms: string[]
```

## Best Practices

1. Use structured metadata access for better type safety
2. Use specialized functions for common metadata categories
3. Access raw attributes through the `spotlight` property
4. Handle optional EXIF and XMP data with optional chaining
5. Verify attribute existence before use
6. Handle missing values gracefully
7. Use type-specific methods when available
8. Consider performance with many attributes
9. Cache metadata results when appropriate

## Examples

### Image Analysis

```typescript
import { discover, QueryBuilder, getMetadata, getExifData } from 'mdfind-node'

async function analyzeImages() {
  // Get image-specific attributes
  const attrs = await discover.attributes({
    forContentType: 'public.image'
  })

  // Get metadata with structured output
  const metadata = await getMetadata('photo.jpg', {
    attributes: attrs.map(a => a.name),
    structured: true
  })

  // Access through spotlight property
  console.log(
    'Dimensions:',
    metadata.spotlight.kMDItemPixelWidth,
    'x',
    metadata.spotlight.kMDItemPixelHeight
  )

  // Or use EXIF data for camera info
  const exif = await getExifData('photo.jpg')
  console.log('Camera:', exif.make, exif.model)
  console.log('Settings:', `f/${exif.fNumber}, ISO ${exif.isoSpeed}`)
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
