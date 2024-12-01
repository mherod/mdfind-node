# mdfind-node

A Node.js wrapper for macOS's `mdfind` command, providing programmatic access to Spotlight search functionality.

## Installation

```bash
pnpm add mdfind-node
```

## Usage

```typescript
import { mdfind } from 'mdfind-node'

// Search for files
const results = await mdfind('query')
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