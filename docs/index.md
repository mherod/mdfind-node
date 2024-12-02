---
layout: home

hero:
  name: mdfind-node
  text: Supercharged macOS file search
  tagline: A powerful Node.js wrapper for macOS's Spotlight search (mdfind), bringing system-level search capabilities to your JavaScript applications.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/mherod/mdfind-node

features:
  - icon: 🚀
    title: Full Spotlight Integration
    details: Access all macOS Spotlight search capabilities through a clean, modern API
  - icon: 🔄
    title: Smart Query Builder
    details: Type-safe, fluent API for building complex searches with ease
  - icon: 📦
    title: Batch Operations
    details: Run multiple searches in parallel or sequence efficiently
  - icon: 📝
    title: Rich Metadata
    details: Access EXIF, XMP, and system metadata with comprehensive type definitions
  - icon: 💪
    title: Type-Safe
    details: Full TypeScript support with detailed types for better development experience
  - icon: 🛠️
    title: Configurable
    details: Extensive options for fine-tuned control over search behavior
---

## Quick Start

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

## Basic Usage

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

## Features

- 🔍 **Full Spotlight Integration**

  - Access all macOS Spotlight search capabilities
  - Real-time file monitoring and updates
  - Rich metadata access

- 🎯 **Smart Query Builder**

  - Type-safe query construction
  - Fluent API design
  - Extensive filtering options

- 📦 **Batch Operations**

  - Parallel search execution
  - Sequential processing
  - Resource management

- 📝 **Rich Metadata**

  - EXIF data extraction
  - XMP metadata support
  - System attribute access

- 🔒 **Type Safety**

  - Full TypeScript support
  - Detailed type definitions
  - Compile-time checks

- ⚡ **Performance**
  - Optimized search execution
  - Memory efficient
  - Configurable buffering
