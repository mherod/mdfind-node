/**
 * This example demonstrates live date-based queries with timeouts
 */

import chalk from 'chalk'
import { subMonths, subQuarters } from 'date-fns'
import { mdfind, QueryBuilder } from 'mdfind-node'

async function main(): Promise<void> {
  try {
    // Create builders for different time periods
    const lastMonthBuilder = new QueryBuilder()
    const thisWeekBuilder = new QueryBuilder()
    const lastQuarterBuilder = new QueryBuilder()

    // Configure search parameters
    const searches = [
      {
        name: 'Last Month',
        builder: lastMonthBuilder
          .modifiedAfter(subMonths(new Date(), 1))
          .withFileTypes(['documents', 'code'])
      },
      {
        name: 'This Week',
        builder: thisWeekBuilder
          .modifiedAfter(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .withFileTypes(['images'])
      },
      {
        name: 'Last Quarter',
        builder: lastQuarterBuilder
          .modifiedAfter(subQuarters(new Date(), 1))
          .withFileTypes(['archives'])
      }
    ]

    // Start concurrent searches
    const searchPromises = searches.map(async ({ name, builder }) => {
      const query = builder.toString()
      const results = await mdfind(query)
      return { name, results }
    })

    // Process results as they come in
    const searchResults = await Promise.all(searchPromises)
    for (const { name, results } of searchResults) {
      console.log(`\n${chalk.blue(name)}:`)
      if (!results || results.length === 0) {
        console.log(chalk.yellow('No files found'))
      } else {
        console.log(chalk.green(`Found ${results.length} files:`))
        results.slice(0, 5).forEach((file: string) => {
          console.log(chalk.gray(`- ${file}`))
        })
        if (results.length > 5) {
          console.log(chalk.gray(`... and ${results.length - 5} more files`))
        }
      }
    }

    console.log(chalk.green('\nAll searches completed'))
  } catch (error) {
    console.error('Error:', error)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
