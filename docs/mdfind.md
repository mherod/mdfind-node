# mdfind Documentation

> Node.js bindings for macOS Spotlight's `mdfind` command

## Overview

The `mdfind` utility provides core search functionality for Spotlight, allowing you to find files based on their content and metadata. Features include:

- Full text and metadata search
- Live updates for file changes
- Directory-scoped searches
- Filename-only searches
- Raw query and interpreted query support

## Basic Usage

```typescript
import { mdfind } from 'mdfind-node'

// Basic text search
const results = await mdfind('skateboard')

// Search in specific directory
const docs = await mdfind('report', {
  onlyIn: '~/Documents'
})

// Search by filename
const configs = await mdfind('', {
  name: '*.json',
  onlyIn: process.cwd()
})
```

## Search Options

| Option          | Type      | Default | Description                            |
| --------------- | --------- | ------- | -------------------------------------- |
| `onlyIn`        | `string`  | -       | Limit search to specific directory     |
| `name`          | `string`  | -       | Search by filename pattern             |
| `live`          | `boolean` | `false` | Enable real-time updates               |
| `count`         | `boolean` | `false` | Return only count of matches           |
| `attr`          | `string`  | -       | Return specific metadata attribute     |
| `smartFolder`   | `string`  | -       | Use saved search                       |
| `nullSeparator` | `boolean` | `false` | Use null character as separator        |
| `maxBuffer`     | `number`  | `10MB`  | Maximum buffer size for results        |
| `reprint`       | `boolean` | `false` | Reprint results in live mode           |
| `literal`       | `boolean` | `false` | Disable special query interpretation   |
| `interpret`     | `boolean` | `false` | Enable natural language interpretation |

## Query Syntax

### Basic Queries

```typescript
// Simple text
await mdfind('term')

// Wildcards
await mdfind('*.pdf')

// Boolean operations
await mdfind('term1 && term2')
await mdfind('term1 || term2')

// Grouping
await mdfind('(term1 || term2) && term3')
```

### Metadata Queries

```typescript
// Exact match
await mdfind('kMDItemAuthor == "John Doe"')

// Contains
await mdfind('kMDItemTextContent == "*search*"')

// Comparison
await mdfind('kMDItemPixelHeight > 1080')

// Date
await mdfind('kMDItemContentCreationDate > $time.today(-30)')
```

## Live Search

Monitor for file changes in real-time:

```typescript
import { mdfindLive } from 'mdfind-node'

const search = mdfindLive(
  'kMDItemContentType == "public.image"',
  {
    onlyIn: '~/Pictures',
    reprint: true
  },
  {
    onResult: paths => {
      console.log('Updated matches:', paths)
    },
    onError: error => {
      if (error.stderr.includes('invalid query')) {
        console.error('Invalid query syntax')
      } else {
        console.error('Search error:', error.message)
      }
    },
    onEnd: () => {
      console.log('Search ended')
    }
  }
)

// Stop monitoring when done
search.kill()
```

## Error Handling

The utility provides detailed error information through the `MdfindError` class:

```typescript
import { mdfind, MdfindError } from 'mdfind-node'

try {
  await mdfind('invalid:query')
} catch (error) {
  if (error instanceof MdfindError) {
    console.error('Search failed:', error.message)
    console.error('Command output:', error.stderr)
  }
}
```

## Common Attributes

Here are some frequently used metadata attributes:

```typescript
// File information
kMDItemDisplayName // File name
kMDItemFSName // File system name
kMDItemFSSize // File size
kMDItemContentType // UTI type
kMDItemKind // Localized type

// Dates
kMDItemContentCreationDate // Creation date
kMDItemContentModificationDate // Modified date
kMDItemLastUsedDate // Last used

// Content
kMDItemTextContent // File content
kMDItemTitle // Document title
kMDItemAuthors // Authors
kMDItemKeywords // Tags/keywords

// Media
kMDItemPixelHeight // Image height
kMDItemPixelWidth // Image width
kMDItemDurationSeconds // Media duration
kMDItemCodecs // Media codecs
```

## Notes

1. Empty queries are not allowed unless using the `-name` option
2. Live updates cannot be combined with count option
3. Literal and interpret options cannot be used together
4. The default buffer size is 10MB
5. Home directory paths (~/...) are automatically expanded

## Examples

### Basic File Search

```typescript
// Find PDF files
const pdfs = await mdfind('kMDItemContentType == "com.adobe.pdf"')

// Find by name pattern
const images = await mdfind('', {
  name: '*.jpg',
  onlyIn: '~/Pictures'
})

// Count matches
const count = await mdfind('kind:image', {
  count: true
})
```

### Metadata Search

```typescript
// Find high-res images
const images = await mdfind('kMDItemPixelHeight > 1080 && kMDItemPixelWidth > 1920')

// Find recent documents
const docs = await mdfind('kMDItemContentModificationDate > $time.today(-7)')

// Find by author
const authored = await mdfind('kMDItemAuthors == "John Doe"')
```

### Live Updates

```typescript
// Monitor for new images
const search = mdfindLive(
  'kind:image',
  {
    onlyIn: '~/Pictures',
    reprint: true
  },
  {
    onResult: paths => {
      for (const path of paths) {
        console.log('New or modified image:', path)
      }
    },
    onError: error => console.error(error),
    onEnd: () => console.log('Monitoring ended')
  }
)

// Stop after 5 minutes
setTimeout(() => search.kill(), 5 * 60 * 1000)
```

## See Also

- [Query Builder Documentation](./query-builder.md) - Type-safe query construction
- [mdls Documentation](./mdls.md) - Get metadata for files
- [mdutil Documentation](./mdutil.md) - Manage Spotlight index

## References

- [macOS mdfind Manual](x-man-page://mdfind)
- [Spotlight Query Format](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/SpotlightQuery/Concepts/QueryFormat.html)
