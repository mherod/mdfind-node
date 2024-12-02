# Getting Started

## Installation

mdfind-node is available on npm and can be installed using your preferred package manager:

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

The most common way to use mdfind-node is through the QueryBuilder class:

```typescript
import { QueryBuilder } from 'mdfind-node'

// Basic file search
const files = await new QueryBuilder().contentType('public.text').containing('important').execute()

// Search with date filters
const recentDocs = await new QueryBuilder().isPDF().modifiedAfter(new Date('2024-01-01')).execute()

// Search with size filters
const largeFiles = await new QueryBuilder()
  .largerThan(100 * 1024 * 1024) // > 100MB
  .execute()
```

## Live Search

To monitor for file changes in real-time:

```typescript
import { QueryBuilder } from 'mdfind-node'

const builder = new QueryBuilder({ live: true })

const search = await builder
  .inDirectory('~/Downloads')
  .contentType('public.image')
  .executeLive(
    file => console.log('New file:', file),
    () => console.log('Search ended')
  )

// Stop the search after 30 seconds
setTimeout(() => search.kill(), 30000)
```

## Working with Metadata

To access file metadata:

```typescript
import { getExtendedMetadata } from 'mdfind-node'

const metadata = await getExtendedMetadata('photo.jpg')
console.log('Basic:', metadata.basic)
console.log('EXIF:', metadata.exif)
console.log('XMP:', metadata.xmp)
```

## Next Steps

- Learn about [Query Builder](../query-builder) for advanced search patterns
- Explore [Batch Operations](../batch) for handling multiple searches
- Understand [Content Types](../content-types) for better type filtering
- Check out [Extended Metadata](../metadata) for rich file information
- Review [Advanced Topics](../advanced-topics) for optimization tips
