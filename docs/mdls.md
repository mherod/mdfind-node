# mdls Documentation

> Node.js bindings for macOS Spotlight's `mdls` command

## Overview

The `mdls` utility lists metadata attributes for files. Features include:

- Full metadata extraction
- Specific attribute filtering
- Raw data output
- Automatic type coercion
- Null value handling
- Structured metadata output

## Basic Usage

```typescript
import { getMetadata } from 'mdfind-node'

// Get all metadata in structured format
const metadata = await getMetadata('path/to/file.jpg', {
  structured: true
})

// Access through categories
console.log(metadata.basic) // Basic file info
console.log(metadata.exif) // EXIF data (if available)
console.log(metadata.xmp) // XMP data (if available)
console.log(metadata.spotlight) // Raw Spotlight attributes

// Get specific attributes
const metadata = await getMetadata('path/to/file.jpg', {
  attributes: ['kMDItemContentType', 'kMDItemPixelHeight'],
  structured: true
})

// Raw output with custom null marker
const metadata = await getMetadata('path/to/file.jpg', {
  raw: true,
  nullMarker: 'N/A',
  structured: true
})
```

## Options

| Option       | Type       | Default    | Description                               |
| ------------ | ---------- | ---------- | ----------------------------------------- |
| `attributes` | `string[]` | `[]`       | List of specific attributes to retrieve   |
| `raw`        | `boolean`  | `false`    | Return raw attribute values               |
| `nullMarker` | `string`   | `'(null)'` | String to use for null values in raw mode |
| `structured` | `boolean`  | `false`    | Return metadata in structured format      |

## Type Coercion

The utility automatically coerces values to appropriate types:

### Dates

Attributes containing "Date" or "date" are converted to Date objects:

```typescript
const metadata = await getMetadata('file.txt', { structured: true })

// Date objects
metadata.spotlight.kMDItemContentCreationDate // Date
metadata.spotlight.kMDItemContentModificationDate // Date
metadata.spotlight.kMDItemLastUsedDate // Date

// Or use structured format
console.log(metadata.basic.created) // Date
console.log(metadata.basic.modified) // Date
console.log(metadata.basic.lastOpened) // Date
```

### Numbers

Attributes containing these terms are converted to numbers:

- Size
- Count
- Number
- BitRate
- Duration
- Height
- Width
- Length
- Speed
- Time

```typescript
const metadata = await getMetadata('image.jpg', { structured: true })

// Numbers through spotlight
metadata.spotlight.kMDItemFSSize // number
metadata.spotlight.kMDItemPixelHeight // number
metadata.spotlight.kMDItemDurationSeconds // number

// Or use structured format
console.log(metadata.basic.size) // number
console.log(metadata.exif?.focalLength) // number
```

### Arrays

Values in parentheses are parsed as arrays:

```typescript
const metadata = await getMetadata('document.pdf', { structured: true })

// Arrays through spotlight
metadata.spotlight.kMDItemAuthors // string[]
metadata.spotlight.kMDItemKeywords // string[]
metadata.spotlight.kMDItemLanguages // string[]

// Or use structured format
console.log(metadata.xmp?.subject) // string[]
```

### Booleans

"true" and "false" strings are converted to booleans:

```typescript
const metadata = await getMetadata('file.txt', { structured: true })

// Booleans through spotlight
metadata.spotlight.kMDItemHasAlphaChannel // boolean
metadata.spotlight.kMDItemIsEncrypted // boolean
```

## Error Handling

The utility throws standard Error objects with descriptive messages:

```typescript
import { getMetadata } from 'mdfind-node'

try {
  await getMetadata('nonexistent.file', { structured: true })
} catch (error) {
  console.error('Failed to get metadata:', error.message)
}
```

## Common Attributes

### File System Attributes

```typescript
// Through spotlight
metadata.spotlight.kMDItemFSName // File name
metadata.spotlight.kMDItemFSSize // File size in bytes
metadata.spotlight.kMDItemFSCreationDate // Creation date
metadata.spotlight.kMDItemFSContentChangeDate // Content modification date
metadata.spotlight.kMDItemFSOwnerUserID // Owner user ID
metadata.spotlight.kMDItemFSInvisible // Hidden file flag

// Or through basic metadata
metadata.basic.name // File name
metadata.basic.size // File size in bytes
metadata.basic.created // Creation date
metadata.basic.modified // Modification date
```

### Content Attributes

```typescript
// Through spotlight
metadata.spotlight.kMDItemContentType // UTI type
metadata.spotlight.kMDItemContentTypeTree // Type hierarchy
metadata.spotlight.kMDItemKind // Localized type description
metadata.spotlight.kMDItemDisplayName // Display name
metadata.spotlight.kMDItemTitle // Document title
metadata.spotlight.kMDItemAuthors // Author array
metadata.spotlight.kMDItemTextContent // Extracted text
metadata.spotlight.kMDItemEncodingApplications // Creating application

// Or through structured metadata
metadata.basic.contentType // UTI type
metadata.basic.kind // Localized type description
metadata.xmp?.title // Document title
metadata.xmp?.creator // Author
```

### Media Attributes

```typescript
// Through spotlight
metadata.spotlight.kMDItemPixelHeight // Image height
metadata.spotlight.kMDItemPixelWidth // Image width
metadata.spotlight.kMDItemColorSpace // Color space
metadata.spotlight.kMDItemBitsPerSample // Color depth
metadata.spotlight.kMDItemDurationSeconds // Media duration
metadata.spotlight.kMDItemCodecs // Media codecs
metadata.spotlight.kMDItemAudioBitRate // Audio quality
metadata.spotlight.kMDItemAudioSampleRate // Sample rate

// Or through EXIF data
metadata.exif?.focalLength // Focal length
metadata.exif?.fNumber // F-number
metadata.exif?.isoSpeed // ISO speed
```

## Notes

1. Some attributes may be unavailable depending on file type
2. Raw mode returns unparsed string values
3. Array values are always split on commas
4. Empty arrays are returned as empty arrays, not null
5. Invalid dates remain as strings
6. EXIF and XMP data may be undefined if not available
7. Use structured mode for better type safety and organization

## Examples

### Basic Metadata

```typescript
const metadata = await getMetadata('document.pdf', { structured: true })

// Through basic metadata
console.log('Name:', metadata.basic.name)
console.log('Size:', metadata.basic.size)
console.log('Type:', metadata.basic.contentType)
console.log('Created:', metadata.basic.created)

// Or through spotlight
console.log('Name:', metadata.spotlight.kMDItemDisplayName)
console.log('Size:', metadata.spotlight.kMDItemFSSize)
console.log('Type:', metadata.spotlight.kMDItemContentType)
console.log('Created:', metadata.spotlight.kMDItemContentCreationDate)
```

### Image Metadata

```typescript
const metadata = await getMetadata('photo.jpg', {
  attributes: [
    'kMDItemPixelHeight',
    'kMDItemPixelWidth',
    'kMDItemColorSpace',
    'kMDItemBitsPerSample'
  ],
  structured: true
})

// Through spotlight
console.log(
  'Dimensions:',
  metadata.spotlight.kMDItemPixelWidth,
  'x',
  metadata.spotlight.kMDItemPixelHeight
)
console.log(
  'Color:',
  metadata.spotlight.kMDItemColorSpace,
  metadata.spotlight.kMDItemBitsPerSample,
  'bit'
)

// Or through EXIF data
if (metadata.exif) {
  console.log('Camera:', metadata.exif.make, metadata.exif.model)
  console.log('Settings:', `f/${metadata.exif.fNumber}, ISO ${metadata.exif.isoSpeed}`)
}
```

### Document Metadata

```typescript
const metadata = await getMetadata('report.pdf', {
  attributes: ['kMDItemTitle', 'kMDItemAuthors', 'kMDItemKeywords', 'kMDItemContentCreationDate'],
  structured: true
})

// Through spotlight
console.log('Title:', metadata.spotlight.kMDItemTitle)
console.log('Authors:', metadata.spotlight.kMDItemAuthors?.join(', '))
console.log('Keywords:', metadata.spotlight.kMDItemKeywords?.join(', '))
console.log('Created:', metadata.spotlight.kMDItemContentCreationDate)

// Or through XMP data
if (metadata.xmp) {
  console.log('Title:', metadata.xmp.title)
  console.log('Creator:', metadata.xmp.creator)
  console.log('Subject:', metadata.xmp.subject?.join(', '))
  console.log('Created:', metadata.xmp.createDate)
}
```

## See Also

- [mdfind Documentation](./mdfind.md) - Search for files
- [mdutil Documentation](./mdutil.md) - Manage Spotlight index
- [Attributes Documentation](./attributes.md) - Available metadata attributes
- [Metadata Documentation](./metadata.md) - Working with structured metadata

## References

- [macOS mdls Manual](x-man-page://mdls)
- [Spotlight Metadata Attributes Reference](https://developer.apple.com/library/archive/documentation/CoreServices/Reference/MetadataAttributesRef/Reference/CommonAttrs.html)
