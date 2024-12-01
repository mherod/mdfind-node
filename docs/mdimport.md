# mdimport Utility Documentation

> Node.js bindings for macOS Spotlight's `mdimport` command

## Overview

The `mdimport` utility is used to import file hierarchies into the macOS Spotlight metadata datastore. It provides functionality for:

- Importing files and directories into the Spotlight index
- Testing Spotlight plugins
- Listing installed plugins and schema
- Re-indexing files when plugins are updated

## Basic Usage

```typescript
import { mdimport } from 'mdfind-node'

// Import a single file
await mdimport('document.pdf')

// Import a directory recursively
await mdimport('~/Documents')

// Test import without modifying index
await mdimport('document.pdf', {
  test: true,
  debugLevel: '2'
})
```

## Import Options

| Option            | Type                | Default | Description                                                                |
| ----------------- | ------------------- | ------- | -------------------------------------------------------------------------- |
| `test`            | `boolean`           | `false` | When true, simulates import and returns attributes without modifying index |
| `debugLevel`      | `'1' \| '2' \| '3'` | -       | Print debug info (requires test mode)                                      |
| `outputFile`      | `string`            | -       | Store attributes in file (requires test mode)                              |
| `showPerformance` | `boolean`           | `false` | Show performance metrics (requires test mode)                              |
| `immediate`       | `boolean`           | `true`  | Force immediate indexing (default behavior)                                |
| `recursive`       | `boolean`           | `true`  | Recursively import directories                                             |
| `maxBuffer`       | `number`            | `512KB` | Maximum output buffer size                                                 |

### Debug Levels

- `1`: Print summary of test import
- `2`: Print summary and all attributes (except kMDItemTextContent)
- `3`: Print summary and all attributes (including kMDItemTextContent)

## Plugin Management

### List Installed Importers

```typescript
import { listImporters } from 'mdfind-node'

const importers = await listImporters()
console.log('Installed importers:', importers)
```

### Reimport Files for Plugin

```typescript
import { reimportForImporter } from 'mdfind-node'

// Reimport all chat files after plugin update
await reimportForImporter('/System/Library/Spotlight/Chat.mdimporter')
```

## Schema and Attributes

### Get Schema Information

```typescript
import { getSchema } from 'mdfind-node'

const schema = await getSchema()
console.log('Spotlight schema:', schema)
```

### List Available Attributes

```typescript
import { listAttributes } from 'mdfind-node'

const attributes = await listAttributes()
console.log('Available attributes:', attributes)
```

## Error Handling

The utility provides detailed error information through the `MdimportError` class:

```typescript
import { mdimport, MdimportError } from 'mdfind-node'

try {
  await mdimport('document.pdf')
} catch (error) {
  if (error instanceof MdimportError) {
    console.error('Import failed:', error.message)
    console.error('Command output:', error.stderr)
    if (error.requiresRoot) {
      console.error('Root privileges required')
    }
  }
}
```

## Advanced Examples

### Test Import with Debug Output

```typescript
// Get detailed attribute information without modifying index
const result = await mdimport('image.jpg', {
  test: true,
  debugLevel: '2',
  showPerformance: true
})
console.log('Import test result:', result)
```

### Import with Output File

```typescript
// Save import results to file
await mdimport('document.pdf', {
  test: true,
  debugLevel: '3',
  outputFile: '~/Desktop/import-results.txt'
})
```

### Batch Directory Import

```typescript
// Import multiple directories
await mdimport(['~/Documents', '~/Pictures', '~/Downloads'])
```

### Immediate Indexing of New Files

```typescript
// Force immediate indexing of a new file
await mdimport('new-document.pdf', {
  immediate: true
})
```

## Notes

1. The `-t` (test) flag and its dependent options (`debugLevel`, `outputFile`, `showPerformance`) are mutually exclusive with normal import operations.

2. Directory imports are always recursive, regardless of the `recursive` option setting.

3. Some stderr output is informational (like locale loading) and doesn't indicate an error.

4. Root privileges may be required for certain operations, particularly when modifying system-level importers.

## See Also

- [mdfind Documentation](./mdfind.md) - File search functionality
- [mdls Documentation](./mdls.md) - Metadata listing
- [mdutil Documentation](./mdutil.md) - Index management

## References

- [macOS mdimport Manual](x-man-page://mdimport)
- [Spotlight Importers Documentation](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/MDImporters/MDImporters.html)
