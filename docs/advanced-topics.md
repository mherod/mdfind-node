# Advanced Topics Documentation

> Advanced usage patterns, optimization, and troubleshooting for mdfind-node

## Performance Optimization

### Batch Size Optimization

The optimal batch size depends on your system resources and use case:

```typescript
import { mdlsBatch } from 'mdfind-node'

// For metadata operations
const METADATA_BATCH_SIZE = 100 // Good balance for metadata extraction
const SEARCH_BATCH_SIZE = 25 // Optimal for complex searches
const IMPORT_BATCH_SIZE = 50 // Balanced for import operations

// Example with optimal batch size
async function processLargeDirectory(directory: string) {
  const files = await getAllFiles(directory)
  const batches = chunk(files, METADATA_BATCH_SIZE)

  for (const batch of batches) {
    const results = await mdlsBatch(batch, {
      concurrency: 4,
      timeout: 30000
    })
    await processResults(results)
  }
}
```

### Memory Management

Strategies for handling large result sets:

```typescript
import { QueryBuilder } from 'mdfind-node'

// Stream results instead of loading all at once
async function* streamLargeResults(query: string) {
  const builder = new QueryBuilder().where(query).maxBuffer(1024 * 1024) // 1MB buffer

  const results = await builder.execute()

  for (const result of results) {
    // Process one result at a time
    yield result
  }
}

// Usage
for await (const result of streamLargeResults('kind:image')) {
  await processResult(result)
}
```

### Caching Strategies

Implement caching for frequently accessed data:

```typescript
import { getMetadata } from 'mdfind-node'
import LRU from 'lru-cache'

const metadataCache = new LRU({
  max: 500, // Maximum items in cache
  ttl: 1000 * 60 * 5 // 5 minute TTL
})

async function getCachedMetadata(path: string) {
  const cached = metadataCache.get(path)
  if (cached) return cached

  const metadata = await getMetadata(path)
  metadataCache.set(path, metadata)
  return metadata
}
```

## Error Recovery and Resilience

### Handling Index Unavailability

```typescript
import { mdfind, QueryBuilder } from 'mdfind-node'

async function resilientSearch(query: string, maxRetries = 3) {
  let attempt = 0

  while (attempt < maxRetries) {
    try {
      return await new QueryBuilder().where(query).execute()
    } catch (error) {
      if (error.message.includes('Spotlight server is disabled')) {
        attempt++
        if (attempt === maxRetries) throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        continue
      }
      throw error
    }
  }
}
```

### Rate Limiting

```typescript
import { Bottleneck } from 'bottleneck'

const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 200 // Minimum time between operations
})

// Wrap operations with rate limiting
const rateLimitedSearch = limiter.wrap(mdfind)
```

## Integration Patterns

### File Watcher Integration

```typescript
import { watch } from 'chokidar'
import { getMetadata, mdfindLive } from 'mdfind-node'

// Combine file watching with live search
function watchWithMetadata(pattern: string) {
  const watcher = watch(pattern, {
    persistent: true,
    ignoreInitial: false
  })

  const search = mdfindLive(pattern, {
    reprint: true
  })

  watcher.on('add', async path => {
    const metadata = await getMetadata(path)
    console.log('New file:', path, metadata)
  })

  search.on('result', paths => {
    console.log('Spotlight found:', paths)
  })

  return {
    watcher,
    search,
    stop: () => {
      watcher.close()
      search.kill()
    }
  }
}
```

### Date Handling with date-fns

```typescript
import { QueryBuilder } from 'mdfind-node'
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isWithinInterval
} from 'date-fns'

// Find files modified in the last month
const lastMonth = await new QueryBuilder()
  .modifiedAfter(startOfMonth(subMonths(new Date(), 1)))
  .modifiedBefore(endOfMonth(subMonths(new Date(), 1)))
  .execute()

// Find documents created this week
const thisWeek = await new QueryBuilder()
  .isPDF()
  .createdAfter(startOfWeek(new Date()))
  .createdBefore(endOfWeek(new Date()))
  .execute()

// Custom date range helper
function withinDateRange(date: Date, start: Date, end: Date) {
  return isWithinInterval(date, { start, end })
}

// Utility class combining QueryBuilder with date-fns
class EnhancedQueryBuilder extends QueryBuilder {
  modifiedInLastMonths(months: number) {
    return this.modifiedAfter(startOfMonth(subMonths(new Date(), months))).modifiedBefore(
      new Date()
    )
  }

  modifiedThisWeek() {
    return this.modifiedAfter(startOfWeek(new Date())).modifiedBefore(endOfWeek(new Date()))
  }

  createdInDateRange(start: Date, end: Date) {
    return this.createdAfter(start).createdBefore(end)
  }

  // Combine with other metadata queries
  recentlyModifiedImages(months = 1) {
    return this.contentType('public.image').modifiedInLastMonths(months)
  }

  thisWeeksDocuments() {
    return this.isPDF().modifiedThisWeek()
  }
}

// Usage examples
const builder = new EnhancedQueryBuilder()

// Find images from the last 3 months
const recentImages = await builder
  .recentlyModifiedImages(3)
  .minImageDimensions(1920, 1080)
  .execute()

// Find documents modified this week
const weeklyDocs = await builder.thisWeeksDocuments().author('John Doe').execute()

// Find files in a specific date range
const rangeFiles = await builder
  .createdInDateRange(new Date('2024-01-01'), new Date('2024-03-31'))
  .execute()

// Complex date-based queries
const complexQuery = await builder
  .useOperator('||')
  .modifiedInLastMonths(1)
  .createdInDateRange(startOfMonth(subMonths(new Date(), 3)), endOfMonth(subMonths(new Date(), 1)))
  .execute()

// Batch operations with date ranges
const queries = [
  builder.recentlyModifiedImages(1).toString(),
  builder.thisWeeksDocuments().toString(),
  builder.createdInDateRange(startOfMonth(new Date()), endOfMonth(new Date())).toString()
]

const batchResults = await mdfindBatch(queries)
```

This integration with `date-fns` provides:

- More intuitive date range queries
- Consistent date handling across your application
- Reusable date-based search patterns
- Type-safe date operations
- Extensive date manipulation capabilities

## Security Considerations

### Permission Management

```typescript
import { promises as fs } from 'fs'
import { getMetadata } from 'mdfind-node'

async function secureMetadataAccess(path: string) {
  try {
    // Check file permissions first
    await fs.access(path, fs.constants.R_OK)

    // Get metadata only if we have read permission
    const metadata = await getMetadata(path)

    // Sanitize sensitive information
    delete metadata.kMDItemAuthors
    delete metadata.kMDItemContactKeywords

    return metadata
  } catch (error) {
    console.error('Permission denied:', path)
    return null
  }
}
```

## Testing Strategies

### Mocking Spotlight Operations

```typescript
import { vi } from 'vitest'
import { mdfind } from 'mdfind-node'

// Mock the mdfind function
vi.mock('mdfind-node', () => ({
  mdfind: vi.fn().mockResolvedValue(['/path/to/file1.jpg', '/path/to/file2.jpg'])
}))

// Test example
test('search images', async () => {
  const results = await mdfind('kind:image')
  expect(results).toHaveLength(2)
  expect(results[0]).toMatch(/\.jpg$/)
})
```

### Integration Testing

```typescript
import { QueryBuilder } from 'mdfind-node'

describe('Spotlight Integration', () => {
  // Create test files before tests
  beforeAll(async () => {
    await createTestFiles()
  })

  // Clean up after tests
  afterAll(async () => {
    await cleanupTestFiles()
  })

  test('find test files', async () => {
    const query = new QueryBuilder().contentType('public.text').containing('test-content')

    const results = await query.execute()
    expect(results).toContain(testFilePath)
  })
})
```

## Troubleshooting Guide

### Common Issues

1. **Index Not Available**

   - Symptom: "Spotlight server is disabled" error
   - Solution: Check system preferences, rebuild index if necessary

   ```typescript
   import { mdutil } from 'mdfind-node'
   await mdutil.rebuild('/Volumes/Data')
   ```

2. **Permission Errors**

   - Symptom: EACCES or permission denied errors
   - Solution: Check file permissions and ownership

   ```typescript
   import { promises as fs } from 'fs'
   await fs.chmod(path, 0o644)
   ```

3. **Memory Issues**
   - Symptom: Process out of memory errors
   - Solution: Implement pagination or streaming
   ```typescript
   // Process results in chunks
   const results = await mdfind('kind:image')
   for (const chunk of chunks(results, 100)) {
     await processChunk(chunk)
   }
   ```

### Debugging Tips

```typescript
import { QueryBuilder } from 'mdfind-node'
import debug from 'debug'

// Enable debug logging
const log = debug('mdfind-node')

async function debugSearch(query: string) {
  log('Starting search:', query)

  const builder = new QueryBuilder().where(query)

  // Log the raw query
  log('Raw query:', builder.toString())

  const results = await builder.execute()
  log('Results count:', results.length)

  return results
}
```

## Migration Guide

### From Raw Commands

```typescript
// Before: Raw command
$ mdfind "kMDItemContentType == 'public.image'"

// After: mdfind-node
import { QueryBuilder } from 'mdfind-node'

const images = await new QueryBuilder()
  .contentType('public.image')
  .execute()

// Before: Raw metadata
$ mdls document.pdf

// After: mdfind-node
import { getMetadata } from 'mdfind-node'

const metadata = await getMetadata('document.pdf')
```

## See Also

- [Query Builder Documentation](./query-builder.md)
- [Batch Operations](./batch.md)
- [Content Types](./content-types.md)

## References

- [Node.js Performance Guide](https://nodejs.org/en/docs/guides/dont-block-the-event-loop)
- [macOS Security Guide](https://support.apple.com/guide/security/welcome/web)
