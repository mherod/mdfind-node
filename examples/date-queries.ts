/**
 * This example demonstrates date-based queries using date-fns.
 * date-fns is included as a devDependency for this example.
 *
 * To run this example:
 * 1. Install dev dependencies: pnpm install
 * 2. Run the example: pnpm examples:date-queries
 */

import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subMonths,
  subQuarters,
  subWeeks,
  subYears
} from 'date-fns'
import { QueryBuilder } from '../src/query-builder.js'

/**
 * Enhanced QueryBuilder with date-fns integration
 */
class DateAwareQueryBuilder extends QueryBuilder {
  /**
   * Find files modified within a specific month
   */
  modifiedInMonth(monthsAgo: number) {
    const targetMonth = subMonths(new Date(), monthsAgo)
    return this.modifiedAfter(startOfMonth(targetMonth)).modifiedBefore(endOfMonth(targetMonth))
  }

  /**
   * Find files modified in the current week
   */
  modifiedThisWeek() {
    return this.modifiedAfter(startOfWeek(new Date())).modifiedBefore(endOfWeek(new Date()))
  }

  /**
   * Find files modified in a previous week
   */
  modifiedInWeek(weeksAgo: number) {
    const targetWeek = subWeeks(new Date(), weeksAgo)
    return this.modifiedAfter(startOfWeek(targetWeek)).modifiedBefore(endOfWeek(targetWeek))
  }

  /**
   * Find files modified in a specific quarter
   */
  modifiedInQuarter(quartersAgo: number) {
    const targetQuarter = subQuarters(new Date(), quartersAgo)
    return this.modifiedAfter(startOfQuarter(targetQuarter)).modifiedBefore(
      endOfQuarter(targetQuarter)
    )
  }

  /**
   * Find files modified in a specific year
   */
  modifiedInYear(yearsAgo: number) {
    const targetYear = subYears(new Date(), yearsAgo)
    return this.modifiedAfter(startOfYear(targetYear)).modifiedBefore(endOfYear(targetYear))
  }
}

async function main() {
  const builder = new DateAwareQueryBuilder()
  const searchDir = process.env.HOME || '~'

  // Example 1: Find files from last month
  console.log('Finding files from last month in your home directory...')
  const lastMonthFiles = await builder.modifiedInMonth(1).inDirectory(searchDir).execute()

  console.log(`Found ${lastMonthFiles.length} files from last month`)

  // Example 2: Find files from this week
  console.log('\nFinding files from this week in your home directory...')
  const thisWeekFiles = await builder.modifiedThisWeek().inDirectory(searchDir).execute()

  console.log(`Found ${thisWeekFiles.length} files modified this week`)

  // Example 3: Find files from last quarter
  console.log('\nFinding files from last quarter in your home directory...')
  const lastQuarterFiles = await builder.modifiedInQuarter(1).inDirectory(searchDir).execute()

  console.log(`Found ${lastQuarterFiles.length} files from last quarter`)

  // Example 4: Find files from last year
  console.log('\nFinding files from last year in your home directory...')
  const lastYearFiles = await builder.modifiedInYear(1).inDirectory(searchDir).execute()

  console.log(`Found ${lastYearFiles.length} files from last year`)

  // Example 5: Complex date-based query
  console.log('\nRunning complex date query in your home directory...')
  const complexQuery = await builder
    .useOperator('||')
    .modifiedInMonth(1)
    .modifiedInWeek(1)
    .modifiedInQuarter(1)
    .inDirectory(searchDir)
    .execute()

  console.log(`Found ${complexQuery.length} files from combined date ranges`)

  // Show some example files
  if (complexQuery.length > 0) {
    console.log('\nExample files found:')
    complexQuery.slice(0, 5).forEach(file => console.log(`- ${file}`))
  }
}

// Run the examples
main().catch(console.error)
