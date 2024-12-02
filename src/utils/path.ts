import { homedir } from 'node:os'

/**
 * Expands ~ to the user's home directory in paths
 */
export function expandPath(path: string): string {
  return path.replace(/^~/, homedir())
}
