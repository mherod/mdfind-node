# mdls Documentation

> Node.js bindings for macOS Spotlight's `mdls` command

## Overview

The `mdls` utility lists metadata attributes for files. Features include:

- Full metadata extraction
- Specific attribute filtering
- Raw data output
- Automatic type coercion
- Null value handling

## Basic Usage

```typescript
import { getMetadata } from 'mdfind-node'

// Get all metadata
const metadata = await getMetadata('path/to/file.jpg')

// Get specific attributes
const attributes = await getMetadata('path/to/file.jpg', {
  attributes: ['kMDItemContentType', 'kMDItemPixelHeight']
})

// Raw output with custom null marker
const raw = await getMetadata('path/to/file.jpg', {
  raw: true,
  nullMarker: 'N/A'
})
```

## Options

| Option       | Type       | Default    | Description                               |
| ------------ | ---------- | ---------- | ----------------------------------------- |
| `attributes` | `string[]` | `[]`       | List of specific attributes to retrieve   |
| `raw`        | `boolean`  | `false`    | Return raw attribute values               |
| `nullMarker` | `string`   | `'(null)'` | String to use for null values in raw mode |

## Type Coercion

The utility automatically coerces values to appropriate types:

### Dates

Attributes containing "Date" or "date" are converted to Date objects:

```typescript
const metadata = await getMetadata('file.txt')

// Date objects
metadata.kMDItemContentCreationDate // Date
metadata.kMDItemContentModificationDate // Date
metadata.kMDItemLastUsedDate // Date
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
const metadata = await getMetadata('image.jpg')

// Numbers
metadata.kMDItemFSSize // number
metadata.kMDItemPixelHeight // number
metadata.kMDItemDurationSeconds // number
```

### Arrays

Values in parentheses are parsed as arrays:

```typescript
const metadata = await getMetadata('document.pdf')

// Arrays
metadata.kMDItemAuthors // string[]
metadata.kMDItemKeywords // string[]
metadata.kMDItemLanguages // string[]
```

### Booleans

"true" and "false" strings are converted to booleans:

```typescript
const metadata = await getMetadata('file.txt')

// Booleans
metadata.kMDItemHasAlphaChannel // boolean
metadata.kMDItemIsEncrypted // boolean
```

## Error Handling

The utility throws standard Error objects with descriptive messages:

```typescript
import { getMetadata } from 'mdfind-node'

try {
  await getMetadata('nonexistent.file')
} catch (error) {
  console.error('Failed to get metadata:', error.message)
}
```

## Common Attributes

### File System Attributes

```typescript
kMDItemFSName // File name
kMDItemFSSize // File size in bytes
kMDItemFSCreationDate // Creation date
kMDItemFSContentChangeDate // Content modification date
kMDItemFSOwnerUserID // Owner user ID
kMDItemFSInvisible // Hidden file flag
```

### Content Attributes

```typescript
kMDItemContentType // UTI type
kMDItemContentTypeTree // Type hierarchy
kMDItemKind // Localized type description
kMDItemDisplayName // Display name
kMDItemTitle // Document title
kMDItemAuthors // Author array
kMDItemTextContent // Extracted text
kMDItemEncodingApplications // Creating application
```

### Media Attributes

```typescript
kMDItemPixelHeight // Image height
kMDItemPixelWidth // Image width
kMDItemColorSpace // Color space
kMDItemBitsPerSample // Color depth
kMDItemDurationSeconds // Media duration
kMDItemCodecs // Media codecs
kMDItemAudioBitRate // Audio quality
kMDItemAudioSampleRate // Sample rate
```

## Notes

1. Some attributes may be unavailable depending on file type
2. Raw mode returns unparsed string values
3. Array values are always split on commas
4. Empty arrays are returned as empty arrays, not null
5. Invalid dates remain as strings

## Examples

### Basic Metadata

```typescript
const metadata = await getMetadata('document.pdf')

console.log('Name:', metadata.kMDItemDisplayName)
console.log('Size:', metadata.kMDItemFSSize)
console.log('Type:', metadata.kMDItemContentType)
console.log('Created:', metadata.kMDItemContentCreationDate)
```

### Image Metadata

```typescript
const metadata = await getMetadata('photo.jpg', {
  attributes: [
    'kMDItemPixelHeight',
    'kMDItemPixelWidth',
    'kMDItemColorSpace',
    'kMDItemBitsPerSample'
  ]
})

console.log('Dimensions:', metadata.kMDItemPixelWidth, 'x', metadata.kMDItemPixelHeight)
console.log('Color:', metadata.kMDItemColorSpace, metadata.kMDItemBitsPerSample, 'bit')
```

### Document Metadata

```typescript
const metadata = await getMetadata('report.pdf', {
  attributes: ['kMDItemTitle', 'kMDItemAuthors', 'kMDItemKeywords', 'kMDItemContentCreationDate']
})

console.log('Title:', metadata.kMDItemTitle)
console.log('Authors:', metadata.kMDItemAuthors?.join(', '))
console.log('Keywords:', metadata.kMDItemKeywords?.join(', '))
console.log('Created:', metadata.kMDItemContentCreationDate)
```

## See Also

- [mdfind Documentation](./mdfind.md) - Search for files
- [mdutil Documentation](./mdutil.md) - Manage Spotlight index
- [Attributes Documentation](./attributes.md) - Available metadata attributes

## References

- [macOS mdls Manual](x-man-page://mdls)
- [Spotlight Metadata Attributes Reference](https://developer.apple.com/library/archive/documentation/CoreServices/Reference/MetadataAttributesRef/Reference/CommonAttrs.html)
