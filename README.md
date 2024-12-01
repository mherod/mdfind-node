# mdfind-node

A Node.js wrapper for macOS's `mdfind` command, providing programmatic access to Spotlight search functionality.

## Installation

```bash
pnpm add mdfind-node
```

## Usage

```typescript
import { mdfind } from 'mdfind-node'

// Basic search
const results = await mdfind('query')

// Search with options
const files = await mdfind('image', {
  onlyIn: '~/Documents',  // Search only in specific directory
  name: 'photo.jpg',      // Search by filename
  live: false,            // Don't keep the query active
  count: false,           // Return full results, not just count
  attr: 'kMDItemAuthors', // Fetch specific metadata attribute
  nullSeparator: false    // Use newline as separator (for xargs compatibility)
})

// Search by filename
const headerFiles = await mdfind('', {
  name: 'stdlib.h'
})

// Count results
const count = await mdfind('MyFavoriteAuthor', {
  count: true
})

// Search in smart folder
const smartFolderResults = await mdfind('', {
  smartFolder: 'MySmartFolder'
})
```

## Error Handling

The library throws `MdfindError` when the command fails:

```typescript
try {
  const results = await mdfind('query')
} catch (error) {
  if (error instanceof MdfindError) {
    console.error('Search failed:', error.message)
    console.error('stderr:', error.stderr)
  }
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## License

ISC