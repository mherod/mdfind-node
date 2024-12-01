# Query Builder Documentation

> Type-safe query construction for macOS Spotlight searches

## Overview

The Query Builder provides a fluent interface for constructing Spotlight queries. It offers:

- Method chaining for building queries
- Common search patterns as predefined methods
- File type filtering
- Metadata attribute matching
- Directory scoping
- Natural language interpretation

## Basic Usage

```typescript
import { QueryBuilder } from 'mdfind-node'

// Create a new query
const query = new QueryBuilder()
  .contentType('public.image')
  .createdAfter(new Date('2023-01-01'))
  .hasGPS()
  .inDirectory('~/Pictures')
  .execute()
```

## Query Methods

### Content Type Filters

```typescript
// Single type
query.contentType('public.image')

// Predefined type filters
query.isText() // public.text
query.isAudiovisual() // public.audiovisual-content
query.isBundle() // com.apple.bundle
query.isApplication() // com.apple.application-bundle
query.isPreferencePane() // com.apple.systempreference
query.isMarkdown() // net.daringfireball.markdown
query.isPlist() // com.apple.property-list
query.isPDF() // com.adobe.pdf
query.isJSON() // public.json
query.isYAML() // public.yaml
```

### Date Filters

```typescript
// Creation date
query.createdBefore(new Date())
query.createdAfter(new Date('2023-01-01'))

// Modification date
query.modifiedBefore(new Date())
query.modifiedAfter(new Date('2023-01-01'))

// Last opened
query.lastOpenedAfter(new Date('2023-01-01'))
```

### Text Content

```typescript
// Full text search
query.containing('searchterm')

// Specific attributes
query.author('John Doe')
query.byAuthor('John Doe') // Alias for author()
query.hasKeyword('typescript')
```

### File Properties

```typescript
// Name patterns
query.named('*.pdf')
query.extension('jpg')

// Size constraints
query.largerThan(1024 * 1024) // 1MB
query.smallerThan(1024 * 1024) // 1MB

// Location
query.inDirectory('~/Documents')

// System properties
query.hasLabel(2) // Finder label color (0-7)
query.isInvisible() // Hidden files
query.ownedBy(501) // File owner by UID
```

### Media Properties

```typescript
// Images
query.minImageDimensions(1920, 1080)
query.inColorSpace('RGB')
query.withBitDepth(16)

// Audio
query.minAudioQuality(44100, 320000)
query.inGenre('Jazz')
query.recordedIn(2024)
query.inAlbum('Greatest Hits')
query.byComposer('Mozart')

// Camera info
query.takenWith('Canon') // Camera make
query.usingModel('EOS R5') // Camera model
query.withISO(100, 400) // ISO range
query.withFocalLength(24, 70) // Focal length range
```

### Location Data

```typescript
// GPS information
query.hasGPS() // Files with location data
```

### Custom Queries

```typescript
// Raw attribute queries
query.where('kMDItemPixelHeight > 1080')
query.where('kMDItemPixelWidth > 1920')

// Multiple conditions
query.useOperator('||') // Change default AND to OR
query.where('condition1')
query.where('condition2')
```

## Search Options

```typescript
// Natural language queries
query.interpret() // Enable query interpretation
query.literal() // Disable special interpretation

// Result options
query.count() // Return only count
query.attribute('kMDItemPixelHeight') // Return specific attribute

// Performance
query.maxBuffer(5 * 1024 * 1024) // 5MB buffer
```

## Execution

```typescript
// Execute query
const results = await query.execute()

// Get query string
console.log(query.toString())
```

## Best Practices

1. Chain related conditions together for readability
2. Use predefined type filters over raw content types
3. Scope searches to specific directories when possible
4. Set appropriate buffer size for large result sets
5. Use natural language interpretation for user input

## Examples

### Finding Recent Documents

```typescript
const docs = await new QueryBuilder()
  .isText()
  .modifiedAfter(new Date(Date.now() - 86400000)) // Last 24 hours
  .inDirectory('~/Documents')
  .execute()
```

### High-Resolution Photos

```typescript
const photos = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(3000, 2000)
  .hasGPS()
  .createdAfter(new Date('2023-01-01'))
  .execute()
```

### Audio Files

```typescript
const audio = await new QueryBuilder()
  .contentType('public.audio')
  .minAudioQuality(44100, 320000)
  .inGenre('Jazz')
  .byComposer('Miles Davis')
  .execute()
```

### Multiple Extensions

```typescript
const images = await new QueryBuilder()
  .useOperator('||')
  .extension('jpg')
  .extension('png')
  .extension('gif')
  .execute()
```

## See Also

- [mdfind Documentation](./mdfind.md) - Core search functionality
- [Attributes Documentation](./attributes.md) - Available metadata attributes
- [Content Types](./content-types.md) - Understanding UTI system

## References

- [Spotlight Query Format](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/SpotlightQuery/Concepts/QueryFormat.html)
- [UTI Reference](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)
