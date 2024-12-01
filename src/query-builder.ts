import { SpotlightContentTypeSchema, type SpotlightContentType } from './schemas/core/spotlight.js'

type ComparisonOperator = '==' | '!=' | '>' | '>=' | '<' | '<='
type LogicalOperator = '&&' | '||'

interface QueryCondition {
  attribute: string
  operator: ComparisonOperator
  value: string | number | boolean | Date
}

/**
 * A fluent API for building Spotlight search queries.
 * This class provides a type-safe way to construct complex Spotlight queries
 * with support for various content types, metadata attributes, and conditions.
 *
 * @example
 * ```typescript
 * const query = new SpotlightQuery()
 *   .contentType('public.image')
 *   .createdAfter(new Date('2024-01-01'))
 *   .hasGPS()
 *   .minImageDimensions(3000, 2000)
 *
 * const results = await mdfind(query.toString())
 * ```
 */
export class SpotlightQuery {
  private conditions: QueryCondition[] = []
  private operator: LogicalOperator = '&&'

  /**
   * Set the logical operator for combining conditions.
   *
   * @param {LogicalOperator} operator - The operator to use ('&&' or '||')
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.useOperator('||')  // Match any condition
   * query.useOperator('&&')  // Match all conditions
   * ```
   */
  public useOperator(operator: LogicalOperator): this {
    this.operator = operator
    return this
  }

  /**
   * Add a raw condition to the query.
   *
   * @param {string} attribute - The Spotlight attribute name
   * @param {ComparisonOperator} operator - The comparison operator
   * @param {string | number | boolean | Date} value - The value to compare against
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.where('kMDItemPixelWidth', '>=', 1920)
   * query.where('kMDItemAuthors', '==', 'John Doe')
   * ```
   */
  public where(
    attribute: string,
    operator: ComparisonOperator,
    value: string | number | boolean | Date
  ): this {
    this.conditions.push({ attribute, operator, value })
    return this
  }

  /**
   * Filter by content type.
   *
   * @param {SpotlightContentType} type - The content type to filter by
   * @returns {this} The query builder instance for chaining
   * @throws {Error} If the content type is invalid
   *
   * @example
   * ```typescript
   * query.contentType('public.image')  // Find images
   * query.contentType('public.audio')  // Find audio files
   * ```
   */
  public contentType(type: SpotlightContentType): this {
    SpotlightContentTypeSchema.parse(type)
    return this.where('kMDItemContentType', '==', type)
  }

  /**
   * Filter by creation date.
   *
   * @param {Date} date - The date to compare against
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.createdAfter(new Date('2024-01-01'))
   * ```
   */
  public createdAfter(date: Date): this {
    return this.where('kMDItemContentCreationDate', '>', date)
  }

  /**
   * Filter by modification date.
   *
   * @param {Date} date - The date to compare against
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.modifiedAfter(new Date('2024-01-01'))
   * ```
   */
  public modifiedAfter(date: Date): this {
    return this.where('kMDItemContentModificationDate', '>', date)
  }

  /**
   * Filter by last used date.
   *
   * @param {Date} date - The date to compare against
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.usedAfter(new Date('2024-01-01'))
   * ```
   */
  public usedAfter(date: Date): this {
    return this.where('kMDItemLastUsedDate', '>', date)
  }

  /**
   * Filter files with GPS data.
   *
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.hasGPS()  // Find files with location data
   * ```
   */
  public hasGPS(): this {
    return this.where('kMDItemLatitude', '>', 0)
  }

  /**
   * Filter by author.
   *
   * @param {string} author - The author name to search for
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.byAuthor('John Doe')
   * ```
   */
  public byAuthor(author: string): this {
    return this.where('kMDItemAuthors', '==', author)
  }

  /**
   * Filter by keyword.
   *
   * @param {string} keyword - The keyword to search for
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.hasKeyword('vacation')
   * ```
   */
  public hasKeyword(keyword: string): this {
    return this.where('kMDItemKeywords', '==', keyword)
  }

  /**
   * Filter by file extension.
   *
   * @param {string} ext - The file extension (with or without leading dot)
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.extension('jpg')
   * query.extension('.pdf')
   * ```
   */
  public extension(ext: string): this {
    return this.where('kMDItemFSName', '==', `*.${ext.replace(/^\./, '')}`)
  }

  /**
   * Filter by minimum image dimensions.
   *
   * @param {number} width - The minimum width in pixels
   * @param {number} height - The minimum height in pixels
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.minImageDimensions(1920, 1080)  // Find HD or larger images
   * ```
   */
  public minImageDimensions(width: number, height: number): this {
    return this.where('kMDItemPixelWidth', '>=', width).where('kMDItemPixelHeight', '>=', height)
  }

  /**
   * Filter by minimum audio quality.
   *
   * @param {number} sampleRate - The minimum sample rate in Hz
   * @param {number} bitRate - The minimum bit rate in bits per second
   * @returns {this} The query builder instance for chaining
   *
   * @example
   * ```typescript
   * query.minAudioQuality(44100, 320000)  // Find high-quality audio
   * ```
   */
  public minAudioQuality(sampleRate: number, bitRate: number): this {
    return this.where('kMDItemAudioSampleRate', '>=', sampleRate).where(
      'kMDItemAudioBitRate',
      '>=',
      bitRate
    )
  }

  /**
   * Convert the query to a string that can be used with mdfind.
   *
   * @returns {string} The Spotlight query string
   *
   * @example
   * ```typescript
   * const queryString = query.toString()
   * const results = await mdfind(queryString)
   * ```
   */
  public toString(): string {
    if (this.conditions.length === 0) {
      return '*'
    }

    return this.conditions
      .map(({ attribute, operator, value }) => {
        let formattedValue = value

        if (typeof value === 'string') {
          // Escape quotes in string values
          formattedValue = `"${value.replace(/"/g, '\\"')}"`
        } else if (value instanceof Date) {
          // Format date for Spotlight query
          formattedValue = `$time.iso(${value.toISOString()})`
        }

        return `${attribute} ${operator} ${formattedValue}`
      })
      .join(` ${this.operator} `)
  }
}
