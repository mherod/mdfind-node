# mdutil Documentation

> Node.js bindings for macOS Spotlight's `mdutil` command

## Overview

The `mdutil` utility manages Spotlight indexing. Features include:

- Check indexing status
- Enable/disable indexing
- Erase and rebuild index
- List index contents
- Volume and directory support
- Root privilege handling

## Basic Usage

```typescript
import { getIndexingStatus, setIndexing, eraseAndRebuildIndex } from 'mdfind-node'

// Check indexing status
const status = await getIndexingStatus('/Volumes/External')

// Enable indexing
await setIndexing('/Volumes/External', true)

// Rebuild index
await eraseAndRebuildIndex('/Volumes/External')
```

## Status Information

The `getIndexingStatus` function returns detailed information:

```typescript
interface IndexStatus {
  state: 'enabled' | 'disabled' | 'unknown' | 'error'
  enabled: boolean
  status: string
  scanBaseTime: Date | null
  reasoning: string | null
  volumePath: string
  isSystemVolume: boolean
}
```

### Example Status Check

```typescript
const status = await getIndexingStatus('/Users')

console.log('State:', status.state)
console.log('Enabled:', status.enabled)
console.log('Last scan:', status.scanBaseTime)
console.log('System volume:', status.isSystemVolume)

if (status.reasoning) {
  console.log('Reason:', status.reasoning)
}
```

## Multiple Volumes

Check status of all volumes:

```typescript
import { getAllVolumesStatus } from 'mdfind-node'

const volumes = await getAllVolumesStatus({
  verbose: true,
  excludeSystemVolumes: true,
  excludeUnknownState: true
})

for (const volume of volumes) {
  console.log(`${volume.volumePath}: ${volume.state}`)
}
```

## Options

### Status Options

| Option                 | Type      | Default | Description                    |
| ---------------------- | --------- | ------- | ------------------------------ |
| `verbose`              | `boolean` | `false` | Include additional details     |
| `resolveRealPath`      | `boolean` | `true`  | Resolve symlinks to real paths |
| `excludeSystemVolumes` | `boolean` | `false` | Filter out system volumes      |
| `excludeUnknownState`  | `boolean` | `false` | Filter out unknown states      |

## Error Handling

The utility provides detailed error information through the `MdutilError` class:

```typescript
import { getIndexingStatus, MdutilError } from 'mdfind-node'

try {
  await getIndexingStatus('/System')
} catch (error) {
  if (error instanceof MdutilError) {
    console.error('Failed:', error.message)
    console.error('Output:', error.stderr)

    if (error.requiresRoot) {
      console.error('Root privileges required')
    }
  }
}
```

## Root Privileges

Many operations require root privileges:

```typescript
try {
  await setIndexing('/Volumes/External', true)
} catch (error) {
  if (error instanceof MdutilError && error.requiresRoot) {
    console.error('Please run with sudo')
  }
}
```

## Examples

### Enable Indexing

```typescript
// Enable indexing for external drive
try {
  await setIndexing('/Volumes/External', true)
  console.log('Indexing enabled')
} catch (error) {
  if (error instanceof MdutilError) {
    if (error.requiresRoot) {
      console.error('Root privileges required')
    } else {
      console.error('Failed:', error.message)
    }
  }
}
```

### Rebuild Index

```typescript
// Erase and rebuild index
try {
  await eraseAndRebuildIndex('/Volumes/External')
  console.log('Index rebuild started')
} catch (error) {
  if (error instanceof MdutilError) {
    if (error.requiresRoot) {
      console.error('Root privileges required')
    } else {
      console.error('Failed:', error.message)
    }
  }
}
```

### Check All Volumes

```typescript
// Get status of all volumes
const volumes = await getAllVolumesStatus({
  verbose: true,
  excludeSystemVolumes: true
})

// Print status summary
for (const volume of volumes) {
  const status = volume.enabled ? 'enabled' : 'disabled'
  const time = volume.scanBaseTime ? volume.scanBaseTime.toLocaleString() : 'never'

  console.log(`${volume.volumePath}:`)
  console.log(`  Status: ${status}`)
  console.log(`  Last scan: ${time}`)
  if (volume.reasoning) {
    console.log(`  Reason: ${volume.reasoning}`)
  }
  console.log()
}
```

### Remove from Spotlight

The `removeFromSpotlight` function provides a convenient way to remove directories from Spotlight indexing:

```typescript
import { removeFromSpotlight, type MdutilError } from 'mdfind-node'

// Remove a directory from Spotlight indexing
try {
  await removeFromSpotlight('/path/to/directory')
  console.log('Directory removed from Spotlight')
} catch (error) {
  if (error instanceof Error && (error as MdutilError).requiresRoot) {
    console.error('Root privileges required')
  } else {
    console.error('Failed:', (error as Error).message)
  }
}
```

The function performs several operations:

1. Checks if the directory is indexed by Spotlight.
2. If indexed, it removes the directory from Spotlight indexing.
3. If the directory is not indexed, it does nothing.

## Notes

1. Most operations require root privileges
2. System volume operations may be restricted
3. Index rebuilding can take significant time
4. Status checks are always allowed
5. Some volumes may report unknown state

## See Also

- [mdfind Documentation](./mdfind.md) - Search for files
- [mdls Documentation](./mdls.md) - Get metadata for files

## References

- [macOS mdutil Manual](x-man-page://mdutil)
- [Spotlight Architecture Overview](https://developer.apple.com/library/archive/documentation/Carbon/Conceptual/MetadataIntro/MetadataIntro.html)
