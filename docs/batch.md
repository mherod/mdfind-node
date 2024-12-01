# Batch Operations Documentation

> Efficient batch processing for Spotlight operations

## Overview

The batch operations module provides efficient ways to process multiple files or operations in parallel. Features include:

- Parallel processing
- Progress tracking
- Error handling
- Memory efficiency
- Result ordering

## Basic Usage

### Batch Metadata Extraction

```typescript
import { mdlsBatch } from 'mdfind-node'

const files = ['file1.jpg', 'file2.jpg', 'file3.jpg']

const results = await mdlsBatch(files, {
  attributes: ['kMDItemContentType', 'kMDItemPixelHeight']
})

// Results maintain file order
for (const [file, metadata] of results) {
  console.log(`${file}: ${metadata.basic.contentType}`)
}
```

### Batch Search Operations

```typescript
import { mdfindBatch } from 'mdfind-node'

const queries = [
  'kMDItemContentType == "public.image"',
  'kMDItemContentType == "public.movie"',
  'kMDItemContentType == "public.audio"'
]

const results = await mdfindBatch(queries)

// Results maintain query order
for (const [query, paths] of results) {
  console.log(`${query}: ${paths.length} matches`)
}
```

### Batch Index Management

```typescript
import { mdutilBatch } from 'mdfind-node'

const volumes = ['/Volumes/Data1', '/Volumes/Data2', '/Volumes/Data3']

// Enable indexing on multiple volumes
const results = await mdutilBatch.enable(volumes)

for (const [volume, success] of results) {
  console.log(`${volume}: ${success ? 'enabled' : 'failed'}`)
}
```

## Options

All batch operations accept these common options:

| Option        | Type      | Default | Description                  |
| ------------- | --------- | ------- | ---------------------------- |
| `concurrency` | `number`  | `4`     | Maximum parallel operations  |
| `timeout`     | `number`  | `30000` | Operation timeout (ms)       |
| `stopOnError` | `boolean` | `false` | Stop on first error          |
| `retries`     | `number`  | `0`     | Retry attempts per operation |
| `retryDelay`  | `number`  | `1000`  | Delay between retries (ms)   |

## Progress Monitoring

Track progress of batch operations:

```typescript
import { mdlsBatch } from 'mdfind-node'

const files = ['file1.jpg', 'file2.jpg', 'file3.jpg']

const results = await mdlsBatch(files, {
  onProgress: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`)
  },
  onError: (file, error) => {
    console.error(`Failed to process ${file}:`, error)
  }
})
```

## Error Handling

Batch operations provide detailed error information:

```typescript
import { mdlsBatch, BatchError } from 'mdfind-node'

try {
  await mdlsBatch(files)
} catch (error) {
  if (error instanceof BatchError) {
    console.error('Batch operation failed:', error.message)
    console.error('Failed items:', error.failures)

    // Individual operation errors
    for (const [item, err] of error.failures) {
      console.error(`${item}:`, err.message)
    }
  }
}
```

## Advanced Usage

### Custom Batch Processing

```typescript
import { batch } from 'mdfind-node'

// Define custom operation
const processor = async (file: string) => {
  const metadata = await mdls(file)
  const searchResults = await mdfind(`kMDItemContentType == "${metadata.basic.contentType}"`)
  return searchResults
}

// Process in batch
const results = await batch(files, processor, {
  concurrency: 2,
  timeout: 60000
})
```

### Batch with Query Builder

```typescript
import { QueryBuilder, mdfindBatch } from 'mdfind-node'

// Create multiple queries
const queries = [
  new QueryBuilder().contentType('public.image').minImageDimensions(1920, 1080),
  new QueryBuilder().contentType('public.movie').minDuration(300)
]

// Execute in batch
const results = await mdfindBatch(queries)
```

### Batch Import Operations

```typescript
import { mdimportBatch } from 'mdfind-node'

const files = ['file1.pdf', 'file2.pdf', 'file3.pdf']

const results = await mdimportBatch(files, {
  plugin: 'com.adobe.pdf',
  attributes: {
    kMDItemKeywords: ['imported', 'batch']
  }
})
```

## Best Practices

1. Choose appropriate concurrency for system resources
2. Use timeouts to prevent hanging operations
3. Implement retry logic for network operations
4. Monitor memory usage with large batches
5. Group similar operations for better performance

## Examples

### Processing Directory Contents

```typescript
import { mdlsBatch } from 'mdfind-node'
import { readdir } from 'fs/promises'

// Get all JPEGs in directory
const dir = '~/Pictures'
const files = (await readdir(dir)).filter(f => f.endsWith('.jpg')).map(f => `${dir}/${f}`)

// Process in batches of 10
const results = await mdlsBatch(files, {
  concurrency: 10,
  attributes: ['kMDItemPixelHeight', 'kMDItemPixelWidth']
})
```

### Batch Status Checks

```typescript
import { mdutilBatch } from 'mdfind-node'

// Check multiple volumes
const volumes = ['/Volumes/Data1', '/Volumes/Data2']
const status = await mdutilBatch.status(volumes)

for (const [volume, info] of status) {
  console.log(`${volume}:`)
  console.log(`  Indexing: ${info.indexing}`)
  console.log(`  Progress: ${info.progressPercent}%`)
}
```

### Mixed Operations

```typescript
import { batch, mdls, mdfind } from 'mdfind-node'

// Complex processing
const processor = async (file: string) => {
  // Get file metadata
  const metadata = await mdls(file)

  // Find similar files
  const similar = await mdfind(
    `kMDItemContentType == "${metadata.basic.contentType}" && ` +
      `kMDItemPixelHeight == ${metadata.exif.pixelHeight}`
  )

  return {
    metadata,
    similar
  }
}

const results = await batch(files, processor)
```

## See Also

- [mdls Documentation](./mdls.md) - Metadata extraction
- [mdfind Documentation](./mdfind.md) - File search
- [mdutil Documentation](./mdutil.md) - Index management
- [mdimport Documentation](./mdimport.md) - File import

## References

- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [Spotlight Architecture](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/MetadataIntro/MetadataIntro.html)
