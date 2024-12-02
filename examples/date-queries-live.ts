/**
 * This example demonstrates live date-based queries with timeouts
 */

import chalk from 'chalk'
import { QueryBuilder } from '../src/query-builder.js'

// File type categories for filtering
const fileTypes = {
  documents: ['pdf', 'doc', 'docx', 'txt', 'md', 'pages', 'numbers', 'key', 'rtf'],
  images: ['jpg', 'jpeg', 'png', 'gif', 'heic', 'raw', 'cr2', 'nef', 'webp'],
  code: ['ts', 'js', 'jsx', 'tsx', 'py', 'rb', 'java', 'swift', 'go', 'rs'],
  archives: ['zip', 'tar', 'gz', 'rar', '7z', 'pkg', 'dmg']
} as const

type FileTypes = typeof fileTypes
type FileType = keyof FileTypes

interface SearchStats {
  total: number
  byType: Record<FileType | 'other', number>
  startTime: Date
}

function getFileType(path: string): FileType | 'other' {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  for (const [type, extensions] of Object.entries(fileTypes)) {
    if ((extensions as readonly string[]).includes(ext)) {
      return type as FileType
    }
  }
  return 'other'
}

function formatDuration(startTime: Date): string {
  const duration = (Date.now() - startTime.getTime()) / 1000
  return `${duration.toFixed(1)}s`
}

function formatStats(stats: SearchStats): string {
  const duration = formatDuration(stats.startTime)
  const typeBreakdown = Object.entries(stats.byType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${type}: ${count} (${((count / stats.total) * 100).toFixed(1)}%)`)
    .join('\n')

  return `Found ${stats.total} files in ${duration}\n${typeBreakdown}`
}

async function runSearch(
  builder: QueryBuilder,
  description: string,
  searchDir: string
): Promise<void> {
  const stats: SearchStats = {
    total: 0,
    byType: {
      documents: 0,
      images: 0,
      code: 0,
      archives: 0,
      other: 0
    },
    startTime: new Date()
  }

  console.log(chalk.cyan(`[${description}] Starting search...`))

  await builder.inDirectory(searchDir).executeLive(
    file => {
      const type = getFileType(file)
      stats.byType[type]++
      stats.total++

      // Color-code output based on file type
      const coloredType = chalk.bold(
        type === 'documents'
          ? chalk.yellow(type)
          : type === 'images'
            ? chalk.magenta(type)
            : type === 'code'
              ? chalk.blue(type)
              : type === 'archives'
                ? chalk.red(type)
                : chalk.gray(type)
      )

      console.log(chalk.dim(`[${description}] ${coloredType}: ${file}`))
    },
    () => {
      console.log(chalk.green(`[${description}] ${formatStats(stats)}`))
    }
  )
}

async function main() {
  // Create builders with different timeouts
  const lastMonthBuilder = new QueryBuilder({ live: true, timeout: 30000 }) // 30 seconds
  const thisWeekBuilder = new QueryBuilder({ live: true, timeout: 30000 })
  const lastQuarterBuilder = new QueryBuilder({ live: true, timeout: 30000 })

  // Set up concurrent searches
  const searches = [
    {
      builder: lastMonthBuilder.modifiedInMonth(1).withFileTypes(['documents', 'code']),
      description: 'Last Month (Documents & Code)',
      directory: process.env.HOME || '~'
    },
    {
      builder: thisWeekBuilder.modifiedThisWeek().withFileTypes(['images']),
      description: 'This Week (Images)',
      directory: `${process.env.HOME}/Pictures` || '~/Pictures'
    },
    {
      builder: lastQuarterBuilder.modifiedInQuarter(1).withFileTypes(['archives']),
      description: 'Last Quarter (Archives)',
      directory: `${process.env.HOME}/Downloads` || '~/Downloads'
    }
  ]

  // Run searches concurrently
  await Promise.all(
    searches.map(({ builder, description, directory }) =>
      runSearch(builder, description, directory)
    )
  )

  console.log(chalk.green('\nAll searches completed'))
  process.exit(0)
}

// Run the example
main().catch(error => {
  console.error(chalk.red('Error:', error))
  process.exit(1)
})
