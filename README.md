# mdfind-node 🔍

> Supercharged macOS file and metadata search using `mdfind` for Node.js! ✨

[![npm version](https://badge.fury.io/js/mdfind-node.svg)](https://www.npmjs.com/package/mdfind-node)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Lint](https://github.com/mherod/mdfind-node/actions/workflows/lint.yml/badge.svg)](https://github.com/mherod/mdfind-node/actions/workflows/lint.yml)

A powerful Node.js wrapper for macOS's Spotlight search (`mdfind`), bringing system-level search capabilities to your JavaScript applications.

## ✨ Features

- 🚀 **Full Spotlight Integration** - Access all macOS Spotlight search capabilities
- 🔄 **Live Search Support** - Real-time file monitoring and updates
- 🎯 **Smart Queries** - Fluent query builder for complex searches
- 📦 **Batch Operations** - Run multiple searches in parallel or sequence
- 📝 **Rich Metadata** - Access EXIF, XMP, and system metadata
- 💪 **Type-Safe** - Full TypeScript support with detailed types
- 🛠️ **Configurable** - Extensive options for fine-tuned control

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
import { mdfind } from 'mdfind-node'

// Basic search
const results = await mdfind('query')

// Advanced search with options
const photos = await mdfind('kMDItemContentType == "public.image"', {
  onlyIn: '~/Pictures',
  live: true,  // Keep watching for changes
  attr: 'kMDItemPixelHeight'  // Get image heights
})

// Use the query builder for complex searches
import { SpotlightQuery } from 'mdfind-node'

const query = new SpotlightQuery()
  .contentType('public.image')
  .createdAfter(new Date('2024-01-01'))
  .hasGPS()
  .minImageDimensions(3000, 2000)

const highResPhotos = await mdfind(query.toString())
```

## 🎯 Key Features

### 🔄 Live Search

```typescript
import { mdfindLive } from 'mdfind-node'

const search = mdfindLive('kMDItemContentType == "public.pdf"', {
  onlyIn: '~/Downloads',
  reprint: true
}, {
  onResult: paths => console.log('New matches:', paths),
  onError: error => console.error('Search error:', error),
  onEnd: () => console.log('Search ended')
})
```

### 📦 Batch Operations

```typescript
import { mdfindBatch } from 'mdfind-node'

const results = await mdfindBatch([
  { query: 'image', onlyIn: '~/Pictures' },
  { query: 'document', onlyIn: '~/Documents' }
])
```

### 📝 Extended Metadata

```typescript
import { getExtendedMetadata } from 'mdfind-node'

const metadata = await getExtendedMetadata('photo.jpg')
console.log('EXIF:', metadata.exif)
console.log('XMP:', metadata.xmp)
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

### Common Content Types

- `public.image` - Image files (JPEG, PNG, etc.)
- `public.audio` - Audio files (MP3, WAV, etc.)
- `public.movie` - Video files (MP4, MOV, etc.)
- `public.pdf` - PDF documents
- `public.plain-text` - Plain text files
- `public.folder` - Folders/Directories

### Common Attributes

- `kMDItemContentType` - The type of content
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

# Run examples
pnpm example       # Basic example
pnpm example:live  # Live search example
pnpm example:query # Query builder example
```

## 📄 License

ISC © [Matthew Herod](https://github.com/mherod)

---