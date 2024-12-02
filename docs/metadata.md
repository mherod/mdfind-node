# Extended Metadata Documentation

> Working with structured metadata in Spotlight

## Overview

The extended metadata module provides type-safe access to common metadata categories:

- Basic file metadata (name, size, dates)
- EXIF metadata for images and media
- XMP metadata for creative assets
- Raw Spotlight metadata

## Basic Usage

```typescript
import {
  getMetadata,
  getBasicMetadata,
  getExifData,
  getXMPData,
  getExtendedMetadata
} from 'mdfind-node'

// Get structured metadata
const metadata = await getMetadata('photo.jpg', {
  structured: true
})

// Access different metadata categories
console.log(metadata.basic.name) // Basic file info
console.log(metadata.exif?.focalLength) // EXIF data (optional)
console.log(metadata.xmp?.creator) // XMP data (optional)
console.log(metadata.spotlight.kMDItemFSName) // Raw Spotlight data

// Or use specialized functions for each category
const basic = await getBasicMetadata('photo.jpg')
const exif = await getExifData('photo.jpg')
const xmp = await getXMPData('photo.jpg')

// Get all metadata at once
const extended = await getExtendedMetadata('photo.jpg')
```

## Basic Metadata

Core file and content metadata:

```typescript
// Using getBasicMetadata
const basic = await getBasicMetadata('document.pdf')

// Or using structured getMetadata
const { basic } = await getMetadata('document.pdf', {
  structured: true
})

// File information
console.log(basic.name) // 'document.pdf'
console.log(basic.size) // 1024
console.log(basic.contentType) // 'com.adobe.pdf'

// Dates
console.log(basic.created) // Date object
console.log(basic.modified) // Date object
console.log(basic.lastOpened) // Date object
```

## EXIF Metadata

Detailed image and media information:

```typescript
// Using getExifData
const exif = await getExifData('photo.jpg')

// Or using structured getMetadata
const { exif } = await getMetadata('photo.jpg', {
  structured: true
})

// Camera information
console.log(exif.make) // 'Canon'
console.log(exif.model) // 'EOS R5'
console.log(exif.lens) // 'RF 24-70mm F2.8L IS USM'

// Capture settings
console.log(exif.exposureTime) // 1/1000
console.log(exif.fNumber) // 2.8
console.log(exif.isoSpeed) // 100
console.log(exif.focalLength) // 50

// GPS data
console.log(exif.gpsLatitude) // 37.7749
console.log(exif.gpsLongitude) // -122.4194
console.log(exif.gpsAltitude) // 100
```

## XMP Metadata

Adobe's Extensible Metadata Platform data:

```typescript
// Using getXMPData
const xmp = await getXMPData('design.psd')

// Or using structured getMetadata
const { xmp } = await getMetadata('design.psd', {
  structured: true
})

// Content information
console.log(xmp.title) // 'Project Design'
console.log(xmp.description) // 'Brand assets'
console.log(xmp.creator) // 'Jane Smith'
console.log(xmp.subject) // ['design', 'logo']

// Rights
console.log(xmp.copyrightNotice) // 'Copyright 2024'
console.log(xmp.rights) // 'All rights reserved'
console.log(xmp.webStatement) // 'https://example.com/rights'

// Dates
console.log(xmp.createDate) // Date object
console.log(xmp.modifyDate) // Date object
console.log(xmp.metadataDate) // Date object
```

## Type Definitions

### Basic Metadata

```typescript
interface BasicMetadata {
  name: string
  contentType?: string | null
  kind?: string | null
  size?: number
  created: Date | null
  modified: Date | null
  lastOpened: Date | null
}
```

### EXIF Metadata

```typescript
interface ExifData {
  make?: string | null
  model?: string | null
  lens?: string | null
  exposureTime?: number | null
  fNumber?: number | null
  isoSpeed?: number | null
  focalLength?: number | null
  gpsLatitude?: number | null
  gpsLongitude?: number | null
  gpsAltitude?: number | null
}
```

### XMP Metadata

```typescript
interface XMPData {
  title?: string | null
  description?: string | null
  creator?: string | null
  subject?: string[] | null
  createDate: Date | null
  modifyDate: Date | null
  metadataDate: Date | null
  copyrightNotice?: string | null
  rights?: string | null
  webStatement?: string | null
}
```

## Raw Metadata

Access any Spotlight attribute:

```typescript
// Get raw metadata
const metadata = await getMetadata('file.txt', { structured: true })
console.log(metadata.spotlight.kMDItemFSSize)
console.log(metadata.spotlight.kMDItemContentType)

// Get specific attributes
const metadata = await getMetadata('file.txt', {
  attributes: ['kMDItemFSSize', 'kMDItemContentType'],
  structured: true
})
```

## Search by Metadata

Use metadata in search queries:

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find high-res photos
const photos = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(3000, 2000)
  .hasGPS()
  .execute()

// Find copyrighted content
const protected = await new QueryBuilder().where('kMDItemCopyright != null').execute()
```

## Best Practices

1. Use specialized functions (`getBasicMetadata`, `getExifData`, `getXMPData`) for better type safety
2. Use `getExtendedMetadata` when you need multiple metadata categories
3. Handle missing metadata gracefully (most fields are optional)
4. Use raw metadata through `metadata.spotlight` for attributes not covered by structured types
5. Consider performance when requesting many attributes
6. Cache metadata results when appropriate

## See Also

- [mdfind Documentation](./mdfind.md) - Search for files
- [Query Builder Documentation](./query-builder.md) - Type-safe query construction
- [Attributes Documentation](./attributes.md) - Available metadata attributes

## References

- [macOS mdls Manual](x-man-page://mdls)
- [EXIF Specification](https://www.exif.org/specifications.html)
- [XMP Specification](https://www.adobe.com/devnet/xmp.html)
