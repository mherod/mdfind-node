# Content Types Documentation

> Understanding and working with macOS Uniform Type Identifiers (UTIs)

## Overview

macOS uses Uniform Type Identifiers (UTIs) to identify file types and data formats. This guide covers:

- Understanding UTI structure
- Common content types
- Working with UTIs in queries
- Content type discovery

## UTI Basics

UTIs follow a reverse-DNS naming convention:

```
public.image              // Base type for all images
com.adobe.photoshop.image // Specific to Photoshop
public.jpeg              // JPEG image format
```

## Common Types

### Document Types

```typescript
import { QueryBuilder } from 'mdfind-node'

// Basic documents
const docs = await new QueryBuilder().contentType('public.content').execute()

// Text documents
const text = await new QueryBuilder().contentType('public.text').execute()

// PDF documents
const pdfs = await new QueryBuilder().contentType('com.adobe.pdf').execute()
```

### Image Types

```typescript
// All images
const images = await new QueryBuilder().contentType('public.image').execute()

// Specific formats
const jpegs = await new QueryBuilder().contentType('public.jpeg').execute()

const pngs = await new QueryBuilder().contentType('public.png').execute()

const raws = await new QueryBuilder().contentType('public.camera-raw-image').execute()
```

### Audio/Video Types

```typescript
// All audiovisual content
const media = await new QueryBuilder().contentType('public.audiovisual-content').execute()

// Audio only
const audio = await new QueryBuilder().contentType('public.audio').execute()

// Video only
const video = await new QueryBuilder().contentType('public.movie').execute()
```

### Archive Types

```typescript
// All archives
const archives = await new QueryBuilder().contentType('public.archive').execute()

// Specific formats
const zips = await new QueryBuilder().contentType('public.zip-archive').execute()

const disk = await new QueryBuilder().contentType('public.disk-image').execute()
```

## Content Type Discovery

### List Available Types

```typescript
import { getContentTypes } from 'mdfind-node'

// Get all registered types
const types = getContentTypes()

// Check descriptions
console.log(types['public.image']) // "Image files (JPEG, PNG, etc.)"
console.log(types['public.audio']) // "Audio files (MP3, WAV, etc.)"
```

## Common UTI Categories

### Base Types

- `public.item` - Base type for all files
- `public.content` - Base type for all content
- `public.data` - Base type for data files
- `public.composite-content` - Multi-type content

### Documents

- `public.text` - Plain text
- `public.plain-text` - Plain text without markup
- `public.rtf` - Rich Text Format
- `public.html` - HTML documents
- `public.xml` - XML documents
- `public.source-code` - Source code files

### Images

- `public.image` - All images
- `public.jpeg` - JPEG images
- `public.png` - PNG images
- `public.tiff` - TIFF images
- `public.camera-raw-image` - Camera RAW files

### Audio/Video

- `public.movie` - Video files
- `public.audio` - Audio files
- `public.mp3` - MP3 audio
- `public.mpeg-4` - MPEG-4 media
- `com.apple.quicktime-movie` - QuickTime movies

### Archives

- `public.archive` - All archives
- `public.zip-archive` - ZIP archives
- `public.disk-image` - Disk images
- `org.gnu.gnu-zip-archive` - GZIP archives

## Best Practices

1. Use standard types over vendor-specific ones
2. Check type existence before querying
3. Handle unknown types gracefully
4. Consider platform-specific types
5. Use content type tree for inclusive searches

## Examples

### Media Library

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find high-quality images
const images = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(1920, 1080)
  .execute()

// Find audio files
const audio = await new QueryBuilder()
  .contentType('public.audio')
  .minAudioQuality(44100, 320000)
  .execute()
```

### Document Search

```typescript
// Find text documents
const docs = await new QueryBuilder().isText().modifiedAfter(new Date('2024-01-01')).execute()

// Find PDFs
const pdfs = await new QueryBuilder()
  .isPDF()
  .largerThan(1024 * 1024) // > 1MB
  .execute()
```

## See Also

- [mdfind Documentation](./mdfind.md) - Core search functionality
- [Query Builder Documentation](./query-builder.md) - Type-safe query construction
- [Attributes Documentation](./attributes.md) - Available metadata attributes

## References

- [UTI Reference](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)
