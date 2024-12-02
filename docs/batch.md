# Batch Operations Documentation

> Efficient batch processing for Spotlight searches

## Overview

The batch operations module provides efficient ways to process multiple Spotlight searches in parallel or sequentially. Features include:

- Parallel search execution
- Sequential search execution
- Multi-directory searching
- Multi-query searching
- Result ordering preservation

## Basic Usage

### Parallel Search Operations

```typescript
import { QueryBuilder } from 'mdfind-node'
import { batchSearch } from 'mdfind-node'

const searches = [
  {
    query: new QueryBuilder().contentType('public.image').hasGPS().toString(),
    options: { onlyInDirectory: '~/Pictures' }
  },
  {
    query: new QueryBuilder().contentType('public.audio').toString(),
    options: { onlyInDirectory: '~/Music' }
  }
]

const results = await batchSearch(searches)
// results[0] contains image search results
// results[1] contains audio search results
```

### Sequential Search Operations

```typescript
import { batchSearchSequential } from 'mdfind-node'

const searches = [
  {
    query: 'kind:image',
    options: { onlyInDirectory: '~/Pictures' }
  },
  {
    query: 'kind:pdf',
    options: { onlyInDirectory: '~/Documents' }
  }
]

const results = await batchSearchSequential(searches)
// Results are processed one at a time
```

## Utility Functions

### Search Across Multiple Directories

```typescript
import { mdfindMultiDirectory } from 'mdfind-node'

const query = new QueryBuilder()
  .extension('ts')
  .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last week
  .toString()

const directories = ['~/Documents', '~/Downloads', '~/Desktop']

const results = await mdfindMultiDirectory(query, directories)
// results[0] contains matches from Documents
// results[1] contains matches from Downloads
// results[2] contains matches from Desktop
```

### Multiple Queries in One Directory

```typescript
import { mdfindMultiQuery } from 'mdfind-node'

const queries = [
  new QueryBuilder().contentType('public.image').hasGPS().toString(),
  new QueryBuilder().contentType('public.movie').toString(),
  new QueryBuilder().contentType('com.adobe.pdf').toString()
]

const documentsPath = '~/Documents'
const results = await mdfindMultiQuery(queries, documentsPath)
// results[0] contains image matches
// results[1] contains movie matches
// results[2] contains PDF matches
```

## Options

All search operations accept the standard mdfind options:

| Option            | Type      | Default | Description                            |
| ----------------- | --------- | ------- | -------------------------------------- |
| `onlyInDirectory` | `string`  | -       | Limit search to specific directory     |
| `maxBuffer`       | `number`  | `1MB`   | Maximum buffer size for results        |
| `literal`         | `boolean` | `false` | Disable special query interpretation   |
| `interpret`       | `boolean` | `false` | Enable natural language interpretation |
| `nullSeparator`   | `boolean` | `false` | Use null character as separator        |
| `reprint`         | `boolean` | `false` | Reprint results in live mode           |

## Best Practices

1. Use `batchSearch` for independent queries that can run in parallel
2. Use `batchSearchSequential` when order matters or for memory-intensive searches
3. Use `mdfindMultiDirectory` when searching the same pattern across different locations
4. Use `mdfindMultiQuery` when running multiple different searches in the same location
5. Set appropriate `maxBuffer` values for large result sets

## Examples

### Media File Organization

```typescript
import { QueryBuilder, batchSearch } from 'mdfind-node'

// Find different types of media files with specific criteria
const searches = [
  {
    query: new QueryBuilder()
      .contentType('public.image')
      .minImageDimensions(3000, 2000)
      .hasGPS()
      .toString(),
    options: { onlyInDirectory: '~/Pictures' }
  },
  {
    query: new QueryBuilder()
      .contentType('public.audio')
      .minAudioQuality(44100, 320000)
      .inGenre('Classical')
      .toString(),
    options: { onlyInDirectory: '~/Music' }
  },
  {
    query: new QueryBuilder()
      .contentType('public.movie')
      .largerThan(1024 * 1024 * 1024) // > 1GB
      .toString(),
    options: { onlyInDirectory: '~/Movies' }
  }
]

const results = await batchSearch(searches)
```

### Development Workspace Analysis

```typescript
import { mdfindMultiQuery } from 'mdfind-node'

// Search for different types of development files
const queries = [
  new QueryBuilder().isText().extension('ts').containing('QueryBuilder').toString(),
  new QueryBuilder().isMarkdown().modifiedAfter(new Date('2024-01-01')).toString(),
  new QueryBuilder().isJSON().containing('dependencies').toString(),
  new QueryBuilder().isPlist().toString()
]

const projectDir = process.cwd()
const results = await mdfindMultiQuery(queries, projectDir)
```

### Multi-Directory Document Search

```typescript
import { mdfindMultiDirectory } from 'mdfind-node'

// Search for documents across multiple locations
const query = new QueryBuilder()
  .useOperator('||')
  .isPDF()
  .isMarkdown()
  .modifiedAfter(new Date('2024-01-01'))
  .toString()

const directories = ['~/Documents', '~/Downloads', '~/Desktop', '~/Library/Documentation']

const results = await mdfindMultiDirectory(query, directories)
```

### Sequential Processing

```typescript
import { batchSearchSequential } from 'mdfind-node'

// Process memory-intensive searches one at a time
const searches = [
  {
    query: new QueryBuilder().contentType('public.image').minImageDimensions(4000, 3000).toString(),
    options: {
      onlyInDirectory: '~/Pictures',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    }
  },
  {
    query: new QueryBuilder()
      .contentType('public.movie')
      .largerThan(2 * 1024 * 1024 * 1024) // > 2GB
      .toString(),
    options: {
      onlyInDirectory: '~/Movies',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    }
  }
]

const results = await batchSearchSequential(searches)
```

## Performance Considerations

1. **Parallel vs Sequential**

   - Use `batchSearch` for independent, lightweight searches
   - Use `batchSearchSequential` for memory-intensive operations
   - Consider system resources when setting concurrency

2. **Buffer Management**

   - Set appropriate `maxBuffer` values based on expected result size
   - Use smaller buffers for many parallel searches
   - Use larger buffers for sequential operations

3. **Directory Scoping**

   - Always specify `onlyInDirectory` to limit search scope
   - Use `mdfindMultiDirectory` for efficient multi-location searches
   - Consider directory size when organizing batch operations

4. **Query Optimization**
   - Combine related queries with `useOperator('||')`
   - Use specific content types and attributes
   - Add date constraints to limit result sets

## Error Handling

```typescript
import { batchSearch, MdfindError } from 'mdfind-node'

try {
  const results = await batchSearch(searches)
} catch (error) {
  if (error instanceof MdfindError) {
    console.error('Search failed:', error.message)
    console.error('stderr:', error.stderr)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Resource Cleanup

```typescript
import { batchSearch } from 'mdfind-node'

// Set timeouts for long-running searches
const timeout = setTimeout(() => {
  // Cleanup logic
  process.exit(1)
}, 30000)

try {
  const results = await batchSearch(searches)
  clearTimeout(timeout)
} catch (error) {
  clearTimeout(timeout)
  throw error
}
```

## See Also

- [mdfind Documentation](./mdfind.md) - Core search functionality
- [Query Builder Documentation](./query-builder.md) - Building search queries

## References

- [Spotlight Query Format](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/SpotlightQuery/Concepts/QueryFormat.html)
