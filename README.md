# mdfind-node 🔍

> Supercharged macOS file and metadata search using `mdfind` for Node.js! ✨

[![npm version](https://badge.fury.io/js/mdfind-node.svg)](https://www.npmjs.com/package/mdfind-node)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Lint](https://github.com/mherod/mdfind-node/actions/workflows/lint.yml/badge.svg)](https://github.com/mherod/mdfind-node/actions/workflows/lint.yml)

A powerful Node.js wrapper for macOS's Spotlight search (`mdfind`), bringing system-level search capabilities to your JavaScript applications.

## ✨ Features

- 🚀 **Full Spotlight Integration** - Access all macOS Spotlight search capabilities
- 🔄 **Smart Query Builder** - Type-safe, fluent API for building complex searches
- 🔄 **Live Search Support** - Real-time file monitoring and updates
- 🌊 **Streaming Results** - Async iterable interface for incremental consumption
- 📦 **Batch Operations** - Run multiple searches in parallel or sequence
- 📝 **Rich Metadata** - Access EXIF, XMP, and system metadata
- 💪 **Type-Safe** - Full TypeScript support with detailed types
- 🛠️ **Configurable** - Extensive options for fine-tuned control
- 🌳 **Type Trees** - Support for content type hierarchies
- 🎨 **Specialized Methods** - Purpose-built methods for common file types

## 📥 Documentation

- [Quick Start Guide](./docs/README.md) - Get started with basic usage
- [Query Builder](./docs/query-builder.md) - Learn about building complex queries
- [Metadata](./docs/metadata.md) - Working with file metadata
- [Content Types](./docs/content-types.md) - Understanding file type hierarchies
- [Batch Operations](./docs/batch.md) - Processing multiple operations
- [Advanced Topics](./docs/advanced-topics.md) - Performance, security, testing, and more

## 📥 Installation

```bash
# Using pnpm (recommended)
pnpm add mdfind-node

# Using npm
npm install mdfind-node

# Using yarn
yarn add mdfind-node

# Using bun
bun add mdfind-node
```

## 🚀 Quick Start

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find recent Markdown files
const docs = await new QueryBuilder()
  .isMarkdown()
  .modifiedAfter(new Date('2024-01-01'))
  .inDirectory('~/Documents')
  .execute()

// Find high-resolution photos
const photos = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(3000, 2000)
  .hasGPS()
  .inDirectory('~/Pictures')
  .execute()

// Find large media files
const videos = await new QueryBuilder()
  .isAudiovisual()
  .largerThan(100 * 1024 * 1024) // > 100MB
  .inDirectory('~/Movies')
  .execute()
```

## 🎯 Key Features

### 🔍 Smart Query Builder

The QueryBuilder provides a fluent, type-safe API for building complex searches:

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find documents by author
const authorDocs = await new QueryBuilder()
  .contentType('com.adobe.pdf')
  .author('John Doe')
  .createdAfter(new Date('2024-01-01'))
  .inDirectory('~/Documents')
  .execute()

// Find photos from a specific camera
const cameraPhotos = await new QueryBuilder()
  .contentType('public.image')
  .takenWith('iPhone 14 Pro')
  .hasGPS()
  .inDirectory('~/Pictures')
  .execute()

// Find code files with specific content
const codeFiles = await new QueryBuilder()
  .isText()
  .extension('ts')
  .containing('QueryBuilder')
  .modifiedAfter(new Date('2024-01-01'))
  .execute()

// Combine conditions with OR
const mediaFiles = await new QueryBuilder()
  .useOperator('||')
  .extension('mp4')
  .extension('mov')
  .extension('avi')
  .largerThan(50 * 1024 * 1024)
  .execute()
```

### 🔄 Live Search

```typescript
import { QueryBuilder, mdfindLive } from 'mdfind-node'

// Method 1: Using QueryBuilder
const builder = new QueryBuilder({ live: true, timeout: 5000 })
const search1 = await builder
  .contentType('public.image')
  .inDirectory('~/Downloads')
  .executeLive(
    file => console.log('New file:', file),
    () => console.log('Search ended after timeout')
  )

// Method 2: Using mdfindLive
const query = new QueryBuilder().isPDF().inDirectory('~/Downloads').toString()
const search2 = mdfindLive(
  query,
  { reprint: true },
  {
    onResult: paths => console.log('New matches:', paths),
    onError: error => console.error('Search error:', error),
    onEnd: () => console.log('Search ended')
  }
)

// Both methods support manual termination
setTimeout(() => {
  search1.kill()
  search2.kill()
}, 10000)
```

### 🌊 Streaming Results (Async Iterable)

```typescript
import { mdfindStream } from 'mdfind-node'

// Consume results one at a time with for-await-of
const stream = mdfindStream('kind:image', { onlyIn: '~/Pictures' })

for await (const filePath of stream) {
  console.error('Found:', filePath)
  // Process each file as it arrives — no buffering
}

// Stop early after collecting enough results
const stream2 = mdfindStream('kind:pdf')
const results: string[] = []

for await (const filePath of stream2) {
  results.push(filePath)
  if (results.length >= 10) {
    stream2.stop()
  }
}
```

### 📦 Batch Operations

```typescript
import { QueryBuilder, batchSearch, mdfindMultiDirectory, mdfindMultiQuery } from 'mdfind-node'

// Method 1: Parallel batch search
const searches = [
  {
    query: new QueryBuilder().contentType('public.image').hasGPS().toString(),
    options: { onlyInDirectory: '~/Pictures' }
  },
  {
    query: new QueryBuilder().contentType('public.audio').inGenre('Jazz').toString(),
    options: { onlyInDirectory: '~/Music' }
  },
  {
    query: new QueryBuilder().isPDF().author('John Doe').toString(),
    options: { onlyInDirectory: '~/Documents' }
  }
]

const results = await batchSearch(searches)

// Method 2: Search same query across directories
const imageQuery = new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(1920, 1080)
  .toString()
const directories = ['~/Pictures', '~/Downloads', '~/Desktop']
const directoryResults = await mdfindMultiDirectory(imageQuery, directories)

// Method 3: Search multiple queries in one directory
const queries = [
  new QueryBuilder().isText().extension('ts').toString(),
  new QueryBuilder().isText().extension('md').toString(),
  new QueryBuilder().isJSON().toString()
]
const devDir = process.cwd()
const queryResults = await mdfindMultiQuery(queries, devDir)
```

### 📝 Extended Metadata

```typescript
import { getExtendedMetadata } from 'mdfind-node'

const metadata = await getExtendedMetadata('photo.jpg')
console.log('Basic:', metadata.basic)
console.log('EXIF:', metadata.exif)
console.log('XMP:', metadata.xmp)
```

### 🎯 Specialized Search Methods

The QueryBuilder includes specialized methods for common file types:

```typescript
import { QueryBuilder } from 'mdfind-node'

// Advanced image search
const proPhotos = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(3000, 2000)
  .withISO(100, 1600)
  .withFocalLength(24, 200)
  .withAperture(1.2, 2.8)
  .hasGPS()
  .modifiedAfter(new Date('2024-01-01'))
  .execute()

// Advanced audio search
const hiResAudio = await new QueryBuilder()
  .contentType('public.audio')
  .withSampleRate(96000)
  .withBitDepth(24)
  .inGenre('Classical')
  .byComposer('Mozart')
  .withDuration(300, 1800) // 5-30 minutes
  .execute()

// Find text files
const textFiles = await new QueryBuilder().isText().modifiedAfter(new Date('2024-01-01')).execute()

// Find media files
const mediaFiles = await new QueryBuilder()
  .isAudiovisual()
  .largerThan(10 * 1024 * 1024)
  .execute()

// Find applications
const apps = await new QueryBuilder().isApplication().inDirectory('/Applications').execute()

// Find configuration files
const configs = await new QueryBuilder().isPlist().inDirectory('~/Library/Preferences').execute()

// Find development files
const devFiles = await new QueryBuilder()
  .useOperator('||')
  .isText()
  .isMarkdown()
  .isJSON()
  .isYAML()
  .inDirectory(process.cwd())
  .execute()
```

## 🔍 Attribute Discovery

Spotlight attributes can be complex to work with. This library provides utilities to help you discover and understand available attributes:

```typescript
import { discoverAttributes, searchAttributes, getContentTypes } from 'mdfind-node'

// Get all available attributes for a specific file
const fileAttributes = discoverAttributes('path/to/file.jpg')

// Search for attributes by keyword
const imageAttrs = searchAttributes('image')
console.log(imageAttrs)
// [
//   {
//     name: 'kMDItemPixelHeight',
//     description: 'Height of the image in pixels',
//     type: 'number',
//     example: 1080,
//     category: 'image'
//   },
//   ...
// ]

// Get all known content types
const contentTypes = getContentTypes()
console.log(contentTypes['public.image']) // 'Image files (JPEG, PNG, etc.)'

// Get attributes by category
const locationAttrs = getAttributesByCategory('location')
```

### Content Type Trees

Files in macOS are organized in a type hierarchy. For example:

```
public.item
└── public.content
    ├── public.text
    │   ├── public.plain-text
    │   └── net.daringfireball.markdown
    └── public.audiovisual-content
        ├── public.audio
        └── public.movie
```

### Common Content Types

Basic Types:

- `public.item` - Base type for all items
- `public.content` - Base type for all content
- `public.text` - Text-based content
- `public.composite-content` - Content with multiple parts

Documents:

- `public.plain-text` - Plain text files
- `public.rtf` - Rich Text Format documents
- `com.adobe.pdf` - Adobe PDF Document
- `net.daringfireball.markdown` - Markdown Document

Media:

- `public.image` - Image files (JPEG, PNG, etc.)
- `public.audio` - Audio files (MP3, WAV, etc.)
- `public.movie` - Video files (MP4, MOV, etc.)
- `public.audiovisual-content` - Audio/Visual content

Code:

- `public.source-code` - Source Code File
- `public.shell-script` - Shell Script
- `public.json` - JSON File
- `public.yaml` - YAML File

System:

- `com.apple.bundle` - Generic Bundle
- `com.apple.application` - Generic Application
- `com.apple.property-list` - Property List (plist)

### Common Attributes

- `kMDItemContentType` - The type of content
- `kMDItemContentTypeTree` - The content type hierarchy
- `kMDItemDisplayName` - The display name of the file
- `kMDItemFSName` - The filename on disk
- `kMDItemContentCreationDate` - When the file was created
- `kMDItemContentModificationDate` - When the file was last modified
- `kMDItemPixelHeight` - Height of the image in pixels
- `kMDItemPixelWidth` - Width of the image in pixels
- `kMDItemLatitude` - GPS latitude where photo/video was taken
- `kMDItemLongitude` - GPS longitude where photo/video was taken

## 👩‍💻 Development

```bash
# Install dependencies
pnpm install

# Development build with watch mode
pnpm dev

# Production build
pnpm build

# Run tests
pnpm test

# Run examples
pnpm examples:basic
pnpm examples:advanced
pnpm examples:query-builder
pnpm examples:live-search
pnpm examples:metadata
pnpm examples:batch
pnpm examples:discover
pnpm examples:content-types
```

## 📄 License

MIT © [Matthew Herod](https://github.com/mherod)

---
