# API Reference

This section provides detailed API documentation for mdfind-node.

## Core Classes

### QueryBuilder

The main class for building and executing Spotlight searches.

```typescript
import { QueryBuilder } from 'mdfind-node'
```

[View full QueryBuilder documentation](../query-builder)

### Utilities

#### mdfind

Low-level wrapper for the `mdfind` command.

```typescript
import { mdfind } from 'mdfind-node'
```

[View mdfind documentation](../mdfind)

#### mdls

Metadata listing utility.

```typescript
import { mdls } from 'mdfind-node'
```

[View mdls documentation](../mdls)

#### mdutil

Index management utility.

```typescript
import { mdutil } from 'mdfind-node'
```

[View mdutil documentation](../mdutil)

#### mdimport

File import and plugin management.

```typescript
import { mdimport } from 'mdfind-node'
```

[View mdimport documentation](../mdimport)

## Type Definitions

### MdfindOptions

Options for configuring Spotlight searches.

```typescript
interface MdfindOptions {
  // Core options
  maxBuffer?: number
  literal?: boolean
  interpret?: boolean

  // Search options
  live?: boolean
  operator?: '&&' | '||'
  count?: boolean
  reprint?: boolean
  nullSeparator?: boolean

  // Filter options
  names?: string[]
  attributes?: string[]
}
```

### ExtendedMetadata

Structure for extended file metadata.

```typescript
interface ExtendedMetadata {
  basic: Record<string, any>
  exif?: Record<string, any>
  xmp?: Record<string, any>
}
```

## Error Handling

All async operations throw standard Error objects with descriptive messages.

```typescript
try {
  const results = await new QueryBuilder().contentType('public.image').execute()
} catch (error) {
  console.error('Search failed:', error.message)
}
```

## Best Practices

1. Always handle errors appropriately
2. Clean up resources in live searches
3. Use type-safe methods when available
4. Set appropriate buffer sizes for large result sets
5. Use batch operations for multiple searches
