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
- 🌳 **Type Trees** - Support for content type hierarchies
- 🎨 **Specialized Methods** - Purpose-built methods for common file types

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
import { QueryBuilder } from 'mdfind-node'

const query = new QueryBuilder()
  .isText()                    // Find text-based content
  .extension('md')             // Markdown files
  .modifiedAfter('2024-01-01') // Modified this year
  .inDirectory('~/Documents')   // In Documents folder
  .execute()
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

### 🎯 Specialized Search Methods

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find text-based files
const textFiles = await new QueryBuilder()
  .isText()
  .execute()

// Find audiovisual content
const mediaFiles = await new QueryBuilder()
  .isAudiovisual()
  .execute()

// Find application bundles
const apps = await new QueryBuilder()
  .isBundle()
  .inDirectory('/Applications')
  .execute()

// Find Markdown files
const docs = await new QueryBuilder()
  .isMarkdown()
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

# Run examples
pnpm example           # Basic example
pnpm example:live      # Live search example
pnpm example:query     # Query builder example
pnpm example:metadata  # Metadata example
pnpm example:batch     # Batch operations example
pnpm example:discover  # Attribute discovery example
pnpm example:types     # Content type example
```

## 📄 License

ISC © [Matthew Herod](https://github.com/mherod)

---