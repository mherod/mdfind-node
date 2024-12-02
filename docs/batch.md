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

### Complex Search Patterns

```typescript
import { QueryBuilder } from 'mdfind-node'
import { batchSearch } from 'mdfind-node'

// Find different types of media files
const searches = [
  {
    query: new QueryBuilder().contentType('public.image').minImageDimensions(1920, 1080).toString(),
    options: { onlyInDirectory: '~/Pictures' }
  },
  {
    query: new QueryBuilder().contentType('public.audio').inGenre('Jazz').toString(),
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

### Directory-Specific Searches

```typescript
import { mdfindMultiDirectory } from 'mdfind-node'

// Search for recent files across common directories
const query = new QueryBuilder()
  .modifiedAfter(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
  .toString()

const directories = ['~/Desktop', '~/Downloads', '~/Documents']

const results = await mdfindMultiDirectory(query, directories)
```

## See Also

- [mdfind Documentation](./mdfind.md) - Core search functionality
- [Query Builder Documentation](./query-builder.md) - Building search queries

## References

- [Spotlight Query Format](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/SpotlightQuery/Concepts/QueryFormat.html)
