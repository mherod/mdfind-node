import { mdfind } from './mdfind.js'
import type { MdfindOptions } from './schemas/index.js'

/**
 * A fluent interface for building and executing Spotlight queries.
 * Provides a type-safe and intuitive way to construct complex search criteria.
 *
 * The builder supports:
 * - Content type filtering
 * - Metadata attribute matching
 * - File name patterns
 * - Directory scoping
 * - Natural language interpretation
 * - Literal query mode
 * - Custom attribute queries
 *
 * @example
 * Basic usage:
 * ```typescript
 * const files = await new QueryBuilder()
 *   .contentType('public.image')
 *   .createdAfter('2023-01-01')
 *   .inDirectory('~/Pictures')
 *   .execute()
 * ```
 */
export class QueryBuilder {
  private conditions: string[] = []
  private options: MdfindOptions = {}

  /**
   * Add a raw query condition.
   * Useful for complex conditions or custom metadata attributes.
   *
   * @param {string} condition - Raw Spotlight query condition
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .where('kMDItemPixelHeight > 1080')
   *   .where('kMDItemPixelWidth > 1920')
   *   .execute()
   * ```
   */
  where(condition: string): this {
    this.conditions.push(condition)
    return this
  }

  /**
   * Filter by content type (UTI).
   * Common types include:
   * - public.image
   * - public.audio
   * - public.movie
   * - public.pdf
   * - public.plain-text
   * - public.rtf
   * - public.html
   * - public.font
   *
   * @param {string} type - Uniform Type Identifier (UTI)
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const images = await new QueryBuilder()
   *   .contentType('public.image')
   *   .execute()
   * ```
   */
  contentType(type: string): this {
    this.conditions.push(`kMDItemContentType == "${type}"`)
    return this
  }

  /**
   * Filter by file name pattern.
   * Supports glob-style patterns.
   *
   * @param {string} pattern - File name pattern to match
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .named('*.pdf')
   *   .execute()
   * ```
   */
  named(pattern: string): this {
    this.options.name = pattern
    return this
  }

  /**
   * Limit search to a specific directory.
   * Supports tilde (~) expansion for home directory.
   *
   * @param {string} path - Directory path to search in
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .inDirectory('~/Documents')
   *   .execute()
   * ```
   */
  inDirectory(path: string): this {
    this.options.onlyIn = path
    return this
  }

  /**
   * Filter by creation date.
   *
   * @param {string | Date} date - Date string or Date object
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .createdAfter('2023-01-01')
   *   .execute()
   * ```
   */
  createdAfter(date: string | Date): this {
    const timestamp = new Date(date).getTime() / 1000
    this.conditions.push(`kMDItemContentCreationDate > $time.iso(${timestamp})`)
    return this
  }

  /**
   * Filter by creation date.
   *
   * @param {string | Date} date - Date string or Date object
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .createdBefore('2023-12-31')
   *   .execute()
   * ```
   */
  createdBefore(date: string | Date): this {
    const timestamp = new Date(date).getTime() / 1000
    this.conditions.push(`kMDItemContentCreationDate < $time.iso(${timestamp})`)
    return this
  }

  /**
   * Filter by modification date.
   *
   * @param {string | Date} date - Date string or Date object
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .modifiedAfter('2023-01-01')
   *   .execute()
   * ```
   */
  modifiedAfter(date: string | Date): this {
    const timestamp = new Date(date).getTime() / 1000
    this.conditions.push(`kMDItemContentModificationDate > $time.iso(${timestamp})`)
    return this
  }

  /**
   * Filter by modification date.
   *
   * @param {string | Date} date - Date string or Date object
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .modifiedBefore('2023-12-31')
   *   .execute()
   * ```
   */
  modifiedBefore(date: string | Date): this {
    const timestamp = new Date(date).getTime() / 1000
    this.conditions.push(`kMDItemContentModificationDate < $time.iso(${timestamp})`)
    return this
  }

  /**
   * Filter by file size in bytes.
   *
   * @param {number} bytes - Minimum file size in bytes
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .largerThan(1024 * 1024) // 1MB
   *   .execute()
   * ```
   */
  largerThan(bytes: number): this {
    this.conditions.push(`kMDItemFSSize > ${bytes}`)
    return this
  }

  /**
   * Filter by file size in bytes.
   *
   * @param {number} bytes - Maximum file size in bytes
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .smallerThan(1024 * 100) // 100KB
   *   .execute()
   * ```
   */
  smallerThan(bytes: number): this {
    this.conditions.push(`kMDItemFSSize < ${bytes}`)
    return this
  }

  /**
   * Filter by file extension.
   *
   * @param {string} ext - File extension without dot
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .extension('pdf')
   *   .execute()
   * ```
   */
  extension(ext: string): this {
    this.conditions.push(`kMDItemFSName ==[c] "*.${ext}"`)
    return this
  }

  /**
   * Filter by author name.
   *
   * @param {string} name - Author's name
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .author('John Doe')
   *   .execute()
   * ```
   */
  author(name: string): this {
    this.conditions.push(`kMDItemAuthors == "${name}"`)
    return this
  }

  /**
   * Filter by text content.
   *
   * @param {string} text - Text to search for
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .containing('important')
   *   .execute()
   * ```
   */
  containing(text: string): this {
    this.conditions.push(`kMDItemTextContent == "${text}"w`)
    return this
  }

  /**
   * Enable natural language query interpretation.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .where('images created today')
   *   .interpret()
   *   .execute()
   * ```
   */
  interpret(): this {
    this.options.interpret = true
    return this
  }

  /**
   * Disable special query interpretation.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .where('kMDItemFSName == "*.txt"')
   *   .literal()
   *   .execute()
   * ```
   */
  literal(): this {
    this.options.literal = true
    return this
  }

  /**
   * Return only the count of matches.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const count = await new QueryBuilder()
   *   .contentType('public.image')
   *   .count()
   *   .execute()
   * ```
   */
  count(): this {
    this.options.count = true
    return this
  }

  /**
   * Return specific metadata attributes.
   *
   * @param {string} attribute - Spotlight metadata attribute
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const metadata = await new QueryBuilder()
   *   .contentType('public.image')
   *   .attribute('kMDItemPixelHeight')
   *   .execute()
   * ```
   */
  attribute(attribute: string): this {
    this.options.attr = attribute
    return this
  }

  /**
   * Execute the search with the built query and options.
   *
   * @returns {Promise<string[]>} Array of file paths matching the query
   * @throws {Error} If the query is invalid or search fails
   *
   * @example
   * Complex search:
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .createdAfter('2023-01-01')
   *   .largerThan(1024 * 1024)
   *   .inDirectory('~/Pictures')
   *   .attribute('kMDItemPixelHeight')
   *   .execute()
   * ```
   */
  async execute(): Promise<string[]> {
    const query = this.conditions.join(' && ') || ''
    return mdfind(query, this.options)
  }
}

/**
 * @deprecated Use QueryBuilder instead. This export is maintained for backward compatibility.
 */
export const SpotlightQuery = QueryBuilder
