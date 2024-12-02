# mdfind-node Documentation

> Comprehensive documentation for the mdfind-node library

## Core Utilities

Each macOS Spotlight command has its own dedicated documentation:

- [mdfind](./mdfind.md) - File search functionality
- [mdls](./mdls.md) - Metadata listing
- [mdutil](./mdutil.md) - Index management
- [mdimport](./mdimport.md) - File import and plugin management

## Query Building

- [Query Builder](./query-builder.md) - Type-safe query construction
  - Basic search operations
  - Advanced query patterns
  - Content type filtering
  - Date and time queries
  - Size and metadata filters
  - Camera and image properties
  - Music and audio attributes

## Additional Features

- [Batch Operations](./batch.md) - Running multiple operations
- [Extended Metadata](./metadata.md) - Working with EXIF, XMP, and basic metadata
- [Content Types](./content-types.md) - Understanding Spotlight's type system
- [Attribute Discovery](./attributes.md) - Finding and using metadata attributes

## Advanced Topics

- [Advanced Topics](./advanced-topics.md)
  - Performance optimization and memory management
  - Error recovery and resilience patterns
  - Integration with other tools
  - Security considerations
  - Testing strategies
  - Troubleshooting guide
  - Migration from raw commands

## Examples

The `examples` directory contains working code samples demonstrating various features:

### Basic Operations

- [basic.ts](../examples/basic.ts) - Basic search operations
- [query-builder.ts](../examples/query-builder.ts) - Query builder basics
- [live-search.ts](../examples/live-search.ts) - Live search monitoring

### Advanced Features

- [advanced.ts](../examples/advanced.ts) - Advanced search patterns
- [advanced-search.ts](../examples/advanced-search.ts) - Complex search scenarios
- [batch.ts](../examples/batch.ts) - Batch operations
- [date-queries.ts](../examples/date-queries.ts) - Date-based queries
- [date-queries-live.ts](../examples/date-queries-live.ts) - Live date monitoring

### Metadata and Content

- [metadata.ts](../examples/metadata.ts) - Basic metadata handling
- [extended-metadata.ts](../examples/extended-metadata.ts) - Extended metadata operations
- [content-types.ts](../examples/content-types.ts) - Content type operations
- [discover.ts](../examples/discover.ts) - Attribute discovery

### System Integration

- [mdimport.ts](../examples/mdimport.ts) - Import operations
- [mdutil-status.ts](../examples/mdutil-status.ts) - Index status checking
- [mdutil-advanced.ts](../examples/mdutil-advanced.ts) - Advanced index management
- [remove-from-spotlight.ts](../examples/remove-from-spotlight.ts) - Excluding content from Spotlight

See the [examples](../examples) directory for the complete collection of working code samples.
