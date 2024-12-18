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
- Live search support
- Parallel and sequential execution

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

// Specialized type methods
query.isText() // public.text
query.isAudiovisual() // public.audiovisual-content
query.isBundle() // com.apple.bundle
query.isPDF() // com.adobe.pdf
query.isMarkdown() // net.daringfireball.markdown
query.isPlist() // com.apple.property-list
query.isJSON() // public.json
query.isYAML() // public.yaml
query.isApplication() // com.apple.application-bundle
query.isPreferencePane() // com.apple.systempreference
query.isComposite() // public.composite-content
```

### Date Filters

```typescript
// Creation date
query.createdAfter(new Date('2024-01-01'))
query.createdBefore(new Date('2024-12-31'))

// Modification date
query.modifiedAfter(new Date('2024-01-01'))
query.modifiedBefore(new Date('2024-12-31'))

// Last opened
query.lastOpenedAfter(new Date('2024-01-01'))
```

### Size Filters

```typescript
// Size constraints
query.largerThan(1024 * 1024) // > 1MB
query.smallerThan(1024 * 100) // < 100KB
```

### File Name and Extension

```typescript
// Name pattern
query.named('project-*')

// Extension
query.extension('pdf')

// Multiple extensions
query.useOperator('||').extension('jpg').extension('png').extension('gif')
```

### Author and Creator

```typescript
// Author
query.author('John Doe')
query.byAuthor('Jane Smith') // Alias for author()

// Encoding application
query.encodedBy('Adobe Photoshop')
```

### Content and Text

```typescript
// Text content
query.containing('important')

// Natural language interpretation
query.where('images created today').interpret()

// Literal query
query.where('kMDItemFSName == "*.txt"').literal()
```

### Image-specific Filters

```typescript
// Basic image filters
query.contentType('public.image').minImageDimensions(1920, 1080) // Minimum width and height

// Camera and shooting information
query.takenWith('Canon') // Camera make
query.usingModel('EOS R5') // Camera model
query.withISO(100, 400) // ISO range
query.withFocalLength(24, 70) // Focal length range (mm)
query.inColorSpace('RGB') // Color space
query.withBitDepth(16) // Bits per sample
query.hasGPS() // Has location data

// Raw metadata queries for other attributes
query.where('kMDItemFNumber <= 2.8') // Aperture
query.where('kMDItemExposureTime < 0.005') // Shutter speed (1/200s)
query.where('kMDItemOrientation == 1') // Orientation

// Combined example for professional photos
const proPhotos = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(3000, 2000) // At least 3000x2000
  .withISO(100, 1600) // Reasonable ISO range
  .withFocalLength(24, 200) // Standard zoom range
  .where('kMDItemFNumber <= 2.8') // Fast lens
  .hasGPS() // Must have location data
  .modifiedAfter(new Date('2024-01-01'))
  .execute()
```

### Audio-specific Filters

```typescript
// Basic audio filters
query.contentType('public.audio').largerThan(5 * 1024 * 1024) // Larger than 5MB

// Audio quality
query.minAudioQuality(44100, 320000) // Sample rate (Hz) and bit rate (bps)
query.withBitDepth(24) // Bits per sample

// Music metadata
query.inGenre('Jazz') // Musical genre
query.recordedIn(2024) // Recording year
query.inAlbum('Greatest Hits') // Album name
query.byComposer('Mozart') // Composer name
query.byAuthor('Miles Davis') // Artist name (alias for author)

// Raw metadata queries for other attributes
query.where('kMDItemAudioChannelCount == 2') // Stereo audio
query.where('kMDItemDurationSeconds >= 180') // Minimum duration
query.where('kMDItemTempo >= 120') // BPM

// Combined example for high-quality music
const highQualityTracks = await new QueryBuilder()
  .contentType('public.audio')
  .minAudioQuality(96000, 1411000) // 96kHz/24-bit FLAC equivalent
  .withBitDepth(24) // High bit depth
  .inGenre('Classical')
  .byComposer('Beethoven')
  .where('kMDItemDurationSeconds >= 300 && kMDItemDurationSeconds <= 1800') // 5-30 minutes
  .modifiedAfter(new Date('2024-01-01'))
  .execute()
```

### File System Attributes

```typescript
// File system properties
query.hasLabel(2) // Finder label color (0-7)
query.isInvisible() // Hidden files
query.ownedBy(501) // File owner by UID
```

### Search Options

```typescript
// Buffer size for results
query.maxBuffer(5 * 1024 * 1024) // 5MB buffer

// Count only
query.count()

// Specific attributes
query.attribute('kMDItemPixelHeight')

// Directory scope
query.inDirectory('~/Documents')
```

### Operator Control

```typescript
// Default is AND ('&&')
query.contentType('public.image').largerThan(1024 * 1024) // AND

// Switch to OR ('||')
query.useOperator('||').extension('jpg').extension('png') // OR
```

## Live Search

```typescript
const builder = new QueryBuilder({ live: true, timeout: 5000 })

await builder
  .contentType('public.image')
  .inDirectory('~/Downloads')
  .executeLive(
    file => console.log('Found:', file),
    () => console.log('Search complete')
  )
```

### Timeout Handling

The live search functionality supports an optional timeout to automatically stop the search after a specified duration:

```typescript
// Set timeout in constructor
const builder = new QueryBuilder({
  live: true,
  timeout: 5000 // Stop after 5 seconds
})

// Or configure with method chain
const builder = new QueryBuilder()
  .maxBuffer(1024 * 1024) // 1MB buffer
  .executeLive(
    file => console.log('Found:', file),
    () => console.log('Search ended after timeout')
  )

// Manual termination is still possible
const search = builder.executeLive(file => console.log('Found:', file))
setTimeout(() => search.kill(), 10000) // Stop after 10 seconds
```

When a timeout is specified:

- The search will automatically stop after the specified duration (in milliseconds)
- The `onComplete` callback will be called when the timeout is reached
- Any pending results will be processed before stopping
- Resources will be properly cleaned up

## Complex Examples

### High-res Photos with GPS

```typescript
const photos = await new QueryBuilder()
  .contentType('public.image')
  .minImageDimensions(3000, 2000)
  .hasGPS()
  .takenWith('Sony')
  .modifiedAfter(new Date('2024-01-01'))
  .execute()
```

### Recent Documents by Author

```typescript
const docs = await new QueryBuilder()
  .useOperator('&&')
  .isPDF()
  .author('John Doe')
  .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .inDirectory('~/Documents')
  .execute()
```

### Music Collection Analysis

```typescript
const jazzTracks = await new QueryBuilder()
  .contentType('public.audio')
  .inGenre('Jazz')
  .recordedIn(2024)
  .byComposer('Miles Davis')
  .execute()

const classicalAlbums = await new QueryBuilder()
  .contentType('public.audio')
  .byComposer('Mozart')
  .inAlbum('Symphony No. 40')
  .execute()
```

### System Files and Configuration

```typescript
const systemPrefs = await new QueryBuilder()
  .useOperator('||')
  .isPreferencePane()
  .isPlist()
  .inDirectory('/System/Library')
  .execute()

const hiddenConfigs = await new QueryBuilder()
  .isPlist()
  .isInvisible()
  .inDirectory('~/Library')
  .execute()
```

## Best Practices

1. Use specialized type methods (`isPDF()`, `isMarkdown()`) instead of raw content types when available
2. Set appropriate buffer sizes for large result sets using `maxBuffer()`
3. Use `live` search with timeout for real-time updates
4. Combine conditions logically with `useOperator()`
5. Use `interpret()` for natural language queries
6. Set directory scope with `inDirectory()` to limit search space
7. Use type-specific methods for better type safety and code clarity
8. Consider using batch operations for multiple related searches
9. Handle errors appropriately in live search scenarios
10. Clean up resources by terminating live searches when no longer needed

## See Also

- [Batch Operations](./batch.md) - Running multiple searches in parallel
- [Content Types](./content-types.md) - Understanding UTI hierarchies
- [Extended Metadata](./metadata.md) - Working with file metadata
- [Advanced Topics](./advanced-topics.md) - Performance and optimization

## References

- [Spotlight Query Format](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/SpotlightQuery/Concepts/QueryFormat.html)
- [UTI Reference](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html)
