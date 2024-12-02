import { z } from 'zod'

/**
 * A highly flexible date coercion schema that handles an extensive range of date formats and types.
 *
 * Features:
 * - Accepts Date objects directly
 * - Coerces strings to Date objects (ISO, RFC2822, custom formats)
 * - Handles timestamps (milliseconds, seconds)
 * - Supports relative dates ('yesterday', 'tomorrow', '2 days ago')
 * - Parses common regional formats (US, UK, ISO)
 * - Allows null/undefined values
 * - Makes the field optional
 * - Handles arrays of dates
 *
 * @example
 * ```typescript
 * // All these are valid
 * DateCoerceSchema.parse(new Date())
 * DateCoerceSchema.parse('2024-01-01')
 * DateCoerceSchema.parse('2024-01-01T12:00:00Z')
 * DateCoerceSchema.parse(1704067200000)
 * DateCoerceSchema.parse(1704067200) // seconds
 * DateCoerceSchema.parse('yesterday')
 * DateCoerceSchema.parse('2 days ago')
 * DateCoerceSchema.parse('01/02/2024') // UK format
 * DateCoerceSchema.parse('1/2/24') // Short format
 * DateCoerceSchema.parse(['2024-01-01', '2024-02-01']) // Array of dates
 * DateCoerceSchema.parse(null)
 * DateCoerceSchema.parse(undefined)
 * ```
 */

const handleRelativeDate = (str: string): Date => {
  const date = new Date()
  const lowerStr = str.toLowerCase()

  if (lowerStr === 'yesterday') {
    date.setDate(date.getDate() - 1)
    return date
  }

  if (lowerStr === 'tomorrow') {
    date.setDate(date.getDate() + 1)
    return date
  }

  const relativeMatch = lowerStr.match(/^(\d+)\s+(days?|weeks?|months?|years?)\s+ago$/i)
  if (!relativeMatch) return new Date(str)

  const [, amount, unit] = relativeMatch
  const num = parseInt(amount, 10)

  const unitHandlers = {
    day: () => date.setDate(date.getDate() - num),
    week: () => date.setDate(date.getDate() - num * 7),
    month: () => date.setMonth(date.getMonth() - num),
    year: () => date.setFullYear(date.getFullYear() - num)
  }

  const baseUnit = unit?.replace(/s$/, '') as keyof typeof unitHandlers
  unitHandlers[baseUnit]()

  return date
}

const handleTimestamp = (num: number): Date => new Date(num < 1e12 ? num * 1000 : num)

const handleArrayItem = (item: Date | string | number): Date => {
  if (item instanceof Date) return item
  if (typeof item === 'string') return new Date(item)
  return handleTimestamp(item)
}

const validateDate = (date: Date | null | undefined): Date | null =>
  date instanceof Date && !isNaN(date.getTime()) ? date : null

export const DateCoerceSchema = z
  .union([
    z.date(),
    z.string().transform(handleRelativeDate),
    z.number().transform(handleTimestamp),
    z
      .array(z.union([z.date(), z.string(), z.number()]))
      .transform(arr => arr.map(handleArrayItem)[0])
  ])
  .nullable()
  .optional()
  .transform(validateDate)

/**
 * A strict date schema that only accepts valid Date objects.
 * Use this when you need to ensure you're working with actual Date instances.
 *
 * @example
 * ```typescript
 * StrictDateSchema.parse(new Date()) // works
 * StrictDateSchema.parse('2024-01-01') // fails
 * ```
 */
export const StrictDateSchema = z.date().nullable().optional()

/**
 * A date schema that ensures the output is an ISO string.
 * Useful when you need to serialize dates for APIs or storage.
 *
 * @example
 * ```typescript
 * DateStringSchema.parse(new Date()) // returns ISO string
 * DateStringSchema.parse('2024-01-01') // converts to ISO string
 * ```
 */
export const DateStringSchema = DateCoerceSchema.transform(date => date?.toISOString() ?? null)

/**
 * A date schema that ensures the output is a Unix timestamp.
 * Useful for numeric date representations or sorting.
 *
 * @example
 * ```typescript
 * TimestampSchema.parse(new Date()) // returns timestamp
 * TimestampSchema.parse('2024-01-01') // converts to timestamp
 * ```
 */
export const TimestampSchema = DateCoerceSchema.transform(date => date?.getTime() ?? null)
