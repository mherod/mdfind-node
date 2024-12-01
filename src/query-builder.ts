import { SpotlightContentTypeSchema, type SpotlightContentType } from './schemas/core/spotlight.js'

type ComparisonOperator = '==' | '!=' | '>' | '>=' | '<' | '<='
type LogicalOperator = '&&' | '||'

interface QueryCondition {
  attribute: string
  operator: ComparisonOperator
  value: string | number | boolean | Date
}

export class SpotlightQuery {
  private conditions: QueryCondition[] = []
  private operator: LogicalOperator = '&&'

  /**
   * Set the logical operator for combining conditions
   */
  public useOperator(operator: LogicalOperator): this {
    this.operator = operator
    return this
  }

  /**
   * Add a raw condition to the query
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
   * Filter by content type
   */
  public contentType(type: SpotlightContentType): this {
    SpotlightContentTypeSchema.parse(type)
    return this.where('kMDItemContentType', '==', type)
  }

  /**
   * Filter by creation date
   */
  public createdAfter(date: Date): this {
    return this.where('kMDItemContentCreationDate', '>', date)
  }

  /**
   * Filter by modification date
   */
  public modifiedAfter(date: Date): this {
    return this.where('kMDItemContentModificationDate', '>', date)
  }

  /**
   * Filter by last used date
   */
  public usedAfter(date: Date): this {
    return this.where('kMDItemLastUsedDate', '>', date)
  }

  /**
   * Filter files with GPS data
   */
  public hasGPS(): this {
    return this.where('kMDItemLatitude', '>', 0)
  }

  /**
   * Filter by author
   */
  public byAuthor(author: string): this {
    return this.where('kMDItemAuthors', '==', author)
  }

  /**
   * Filter by keyword
   */
  public hasKeyword(keyword: string): this {
    return this.where('kMDItemKeywords', '==', keyword)
  }

  /**
   * Filter by file extension
   */
  public extension(ext: string): this {
    return this.where('kMDItemFSName', '==', `*.${ext.replace(/^\./, '')}`)
  }

  /**
   * Filter by minimum image dimensions
   */
  public minImageDimensions(width: number, height: number): this {
    return this.where('kMDItemPixelWidth', '>=', width).where('kMDItemPixelHeight', '>=', height)
  }

  /**
   * Filter by minimum audio quality
   */
  public minAudioQuality(sampleRate: number, bitRate: number): this {
    return this.where('kMDItemAudioSampleRate', '>=', sampleRate).where(
      'kMDItemAudioBitRate',
      '>=',
      bitRate
    )
  }

  /**
   * Convert the query to a string
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
