# Examples

This section contains practical examples demonstrating various features of mdfind-node.

## Basic Operations

### Simple Search

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find text files containing specific content
const files = await new QueryBuilder().isText().containing('TODO').execute()

// Find files by extension
const images = await new QueryBuilder()
  .useOperator('||')
  .extension('jpg')
  .extension('png')
  .execute()
```

### Date-Based Queries

```typescript
import { QueryBuilder } from 'mdfind-node'

// Find files modified today
const todayFiles = await new QueryBuilder()
  .modifiedAfter(new Date(new Date().setHours(0, 0, 0, 0)))
  .execute()

// Find files created in the last week
const weekFiles = await new QueryBuilder()
  .createdAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .execute()
```

## Advanced Features

### Live Search Monitoring

```typescript
import { QueryBuilder } from 'mdfind-node'

// Monitor for new images in Downloads
const search = await new QueryBuilder({ live: true })
  .contentType('public.image')
  .inDirectory('~/Downloads')
  .executeLive(
    file => console.log('New image:', file),
    () => console.log('Search ended')
  )

// Clean up after 5 minutes
setTimeout(() => search.kill(), 5 * 60 * 1000)
```

### Batch Operations

```typescript
import { batchSearch } from 'mdfind-node'

// Run multiple searches in parallel
const searches = [
  {
    query: new QueryBuilder().isPDF().toString(),
    options: { onlyInDirectory: '~/Documents' }
  },
  {
    query: new QueryBuilder().isImage().toString(),
    options: { onlyInDirectory: '~/Pictures' }
  }
]

const results = await batchSearch(searches)
```

## Working with Metadata

### Extended Metadata

```typescript
import { getExtendedMetadata } from 'mdfind-node'

// Get rich metadata for an image
const metadata = await getExtendedMetadata('photo.jpg')

// Access specific metadata types
console.log('Camera:', metadata.exif.Make, metadata.exif.Model)
console.log('GPS:', metadata.exif.GPSLatitude, metadata.exif.GPSLongitude)
console.log('Created:', metadata.basic.ContentCreationDate)
```

### Content Type Discovery

```typescript
import { discoverAttributes } from 'mdfind-node'

// Get all available attributes for a file
const attributes = await discoverAttributes('document.pdf')
console.log('Available attributes:', attributes)
```

## System Integration

### Index Management

```typescript
import { mdutil } from 'mdfind-node'

// Check index status
const status = await mdutil.getStatus()
console.log('Index status:', status)

// Remove directory from index
await mdutil.remove('~/Private')
```

### Import Operations

```typescript
import { mdimport } from 'mdfind-node'

// Import file metadata
await mdimport.file('document.pdf')

// Import directory
await mdimport.directory('~/Documents/Reports')
```

## More Examples

Check out our [examples directory](https://github.com/mherod/mdfind-node/tree/main/examples) on GitHub for more working code samples:

- [Basic Search](https://github.com/mherod/mdfind-node/blob/main/examples/basic.ts)
- [Query Builder](https://github.com/mherod/mdfind-node/blob/main/examples/query-builder.ts)
- [Live Search](https://github.com/mherod/mdfind-node/blob/main/examples/live-search.ts)
- [Advanced Search](https://github.com/mherod/mdfind-node/blob/main/examples/advanced-search.ts)
- [Batch Operations](https://github.com/mherod/mdfind-node/blob/main/examples/batch.ts)
- [Date Queries](https://github.com/mherod/mdfind-node/blob/main/examples/date-queries.ts)
- [Metadata Operations](https://github.com/mherod/mdfind-node/blob/main/examples/metadata.ts)
- [Content Types](https://github.com/mherod/mdfind-node/blob/main/examples/content-types.ts)
