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
  private operator: '&&' | '||' = '&&'

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
  public where(condition: string): this {
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
  public contentType(type: string): this {
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
  public named(pattern: string): this {
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
  public inDirectory(path: string): this {
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
  public createdAfter(date: string | Date): this {
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
  public createdBefore(date: string | Date): this {
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
  public modifiedAfter(date: string | Date): this {
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
  public modifiedBefore(date: string | Date): this {
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
  public largerThan(bytes: number): this {
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
  public smallerThan(bytes: number): this {
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
  public extension(ext: string): this {
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
  public author(name: string): this {
    this.conditions.push(`kMDItemAuthors == "${name}"`)
    return this
  }

  /**
   * Filter by author or artist.
   * Alias for author() method with more descriptive name for media files.
   *
   * @param {string} name - Author or artist name
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.audio')
   *   .byAuthor('Radiohead')
   *   .execute()
   * ```
   */
  public byAuthor(name: string): this {
    return this.author(name)
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
  public containing(text: string): this {
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
  public interpret(): this {
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
  public literal(): this {
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
  public count(): this {
    this.options.count = true
    return this
  }

  /**
   * Return specific metadata attributes.
   *
   * @param {string} name - Spotlight metadata attribute
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
  public attribute(name: string): this {
    this.options.attr = name
    return this
  }

  /**
   * Filter for files that have GPS data.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .hasGPS()
   *   .execute()
   * ```
   */
  public hasGPS(): this {
    this.conditions.push('kMDItemLatitude != null && kMDItemLongitude != null')
    return this
  }

  /**
   * Filter for audio files with minimum quality requirements.
   *
   * @param {number} sampleRate - Minimum sample rate in Hz (e.g., 44100)
   * @param {number} bitRate - Minimum bit rate in bits/second (e.g., 320000)
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.audio')
   *   .minAudioQuality(44100, 320000)
   *   .execute()
   * ```
   */
  public minAudioQuality(sampleRate: number, bitRate: number): this {
    this.conditions.push(
      `kMDItemAudioSampleRate >= ${sampleRate} && kMDItemAudioBitRate >= ${bitRate}`
    )
    return this
  }

  /**
   * Set the logical operator for multiple conditions.
   * Default is AND (&&). Use this to change to OR (||).
   *
   * @param {string} op - Logical operator ('&&' or '||')
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .useOperator('||')
   *   .extension('jpg')
   *   .extension('png')
   *   .execute()
   * ```
   */
  public useOperator(op: '&&' | '||'): this {
    this.operator = op
    return this
  }

  /**
   * Filter by keyword in content or metadata.
   *
   * @param {string} keyword - Keyword to search for
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .hasKeyword('typescript')
   *   .execute()
   * ```
   */
  public hasKeyword(keyword: string): this {
    this.conditions.push(`(kMDItemTextContent == "${keyword}"w || kMDItemKeywords == "${keyword}")`)
    return this
  }

  /**
   * Filter images by minimum dimensions.
   *
   * @param {number} width - Minimum width in pixels
   * @param {number} height - Minimum height in pixels
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .minImageDimensions(1920, 1080)
   *   .execute()
   * ```
   */
  public minImageDimensions(width: number, height: number): this {
    this.conditions.push(`kMDItemPixelWidth >= ${width} && kMDItemPixelHeight >= ${height}`)
    return this
  }

  /**
   * Filter for application bundles.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const apps = await new QueryBuilder()
   *   .isApplication()
   *   .execute()
   * ```
   */
  public isApplication(): this {
    this.conditions.push('kMDItemContentType == "com.apple.application-bundle"')
    return this
  }

  /**
   * Filter for system preference panes.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const prefs = await new QueryBuilder()
   *   .isPreferencePane()
   *   .execute()
   * ```
   */
  public isPreferencePane(): this {
    this.conditions.push('kMDItemContentType == "com.apple.systempreference"')
    return this
  }

  /**
   * Filter by Finder label color.
   *
   * @param {number} label - Label index (0-7)
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .hasLabel(2) // Red label
   *   .execute()
   * ```
   */
  public hasLabel(label: number): this {
    this.conditions.push(`kMDItemFSLabel == ${label}`)
    return this
  }

  /**
   * Filter for invisible files.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isInvisible()
   *   .execute()
   * ```
   */
  public isInvisible(): this {
    this.conditions.push('kMDItemFSInvisible == 1')
    return this
  }

  /**
   * Filter by file owner.
   *
   * @param {number} uid - User ID
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .ownedBy(501) // Standard user ID
   *   .execute()
   * ```
   */
  public ownedBy(uid: number): this {
    this.conditions.push(`kMDItemFSOwnerUserID == ${uid}`)
    return this
  }

  /**
   * Filter by encoding application.
   *
   * @param {string} appName - Application name
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .encodedBy('Adobe Photoshop')
   *   .execute()
   * ```
   */
  public encodedBy(appName: string): this {
    this.conditions.push(`kMDItemEncodingApplications == "${appName}"`)
    return this
  }

  /**
   * Filter by musical genre.
   *
   * @param {string} genre - Musical genre
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.audio')
   *   .inGenre('Jazz')
   *   .execute()
   * ```
   */
  public inGenre(genre: string): this {
    this.conditions.push(`kMDItemMusicalGenre == "${genre}"`)
    return this
  }

  /**
   * Filter by recording year.
   *
   * @param {number} year - Recording year
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.audio')
   *   .recordedIn(2024)
   *   .execute()
   * ```
   */
  public recordedIn(year: number): this {
    this.conditions.push(`kMDItemRecordingYear == ${year}`)
    return this
  }

  /**
   * Filter by album name.
   *
   * @param {string} name - Album name
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.audio')
   *   .inAlbum('Greatest Hits')
   *   .execute()
   * ```
   */
  public inAlbum(name: string): this {
    this.conditions.push(`kMDItemAlbum == "${name}"`)
    return this
  }

  /**
   * Filter by composer.
   *
   * @param {string} name - Composer name
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.audio')
   *   .byComposer('Mozart')
   *   .execute()
   * ```
   */
  public byComposer(name: string): this {
    this.conditions.push(`kMDItemComposer == "${name}"`)
    return this
  }

  /**
   * Filter by camera make.
   *
   * @param {string} make - Camera manufacturer
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .takenWith('Canon')
   *   .execute()
   * ```
   */
  public takenWith(make: string): this {
    this.conditions.push(`kMDItemAcquisitionMake == "${make}"`)
    return this
  }

  /**
   * Filter by camera model.
   *
   * @param {string} model - Camera model
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .usingModel('EOS R5')
   *   .execute()
   * ```
   */
  public usingModel(model: string): this {
    this.conditions.push(`kMDItemAcquisitionModel == "${model}"`)
    return this
  }

  /**
   * Filter by ISO speed.
   *
   * @param {number} min - Minimum ISO speed
   * @param {number} max - Maximum ISO speed
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .withISO(100, 400)
   *   .execute()
   * ```
   */
  public withISO(min: number, max: number): this {
    this.conditions.push(`kMDItemISOSpeed >= ${min} && kMDItemISOSpeed <= ${max}`)
    return this
  }

  /**
   * Filter by focal length.
   *
   * @param {number} min - Minimum focal length in mm
   * @param {number} max - Maximum focal length in mm
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .withFocalLength(24, 70)
   *   .execute()
   * ```
   */
  public withFocalLength(min: number, max: number): this {
    this.conditions.push(`kMDItemFocalLength >= ${min} && kMDItemFocalLength <= ${max}`)
    return this
  }

  /**
   * Filter by color space.
   *
   * @param {string} colorSpace - Color space name (e.g., 'RGB', 'CMYK')
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .inColorSpace('RGB')
   *   .execute()
   * ```
   */
  public inColorSpace(colorSpace: string): this {
    this.conditions.push(`kMDItemColorSpace == "${colorSpace}"`)
    return this
  }

  /**
   * Filter by bits per sample.
   *
   * @param {number} bits - Bits per sample
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .contentType('public.image')
   *   .withBitDepth(16)
   *   .execute()
   * ```
   */
  public withBitDepth(bits: number): this {
    this.conditions.push(`kMDItemBitsPerSample == ${bits}`)
    return this
  }

  /**
   * Set the maximum buffer size for the search results.
   *
   * @param {number} bytes - Maximum buffer size in bytes
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .maxBuffer(5 * 1024 * 1024) // 5MB buffer
   *   .execute()
   * ```
   */
  public maxBuffer(bytes: number): this {
    this.options.maxBuffer = bytes
    return this
  }

  /**
   * Filter for text-based content.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isText()
   *   .execute()
   * ```
   */
  public isText(): this {
    this.conditions.push('kMDItemContentTypeTree == "public.text"')
    return this
  }

  /**
   * Filter for composite content.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isComposite()
   *   .execute()
   * ```
   */
  public isComposite(): this {
    this.conditions.push('kMDItemContentTypeTree == "public.composite-content"')
    return this
  }

  /**
   * Filter for audiovisual content.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isAudiovisual()
   *   .execute()
   * ```
   */
  public isAudiovisual(): this {
    this.conditions.push('kMDItemContentTypeTree == "public.audiovisual-content"')
    return this
  }

  /**
   * Filter for bundle content.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isBundle()
   *   .execute()
   * ```
   */
  public isBundle(): this {
    this.conditions.push('kMDItemContentTypeTree == "com.apple.bundle"')
    return this
  }

  /**
   * Filter for Markdown files.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isMarkdown()
   *   .execute()
   * ```
   */
  public isMarkdown(): this {
    this.conditions.push('kMDItemContentType == "net.daringfireball.markdown"')
    return this
  }

  /**
   * Filter for property list files.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isPlist()
   *   .execute()
   * ```
   */
  public isPlist(): this {
    this.conditions.push('kMDItemContentType == "com.apple.property-list"')
    return this
  }

  /**
   * Filter for PDF documents.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isPDF()
   *   .execute()
   * ```
   */
  public isPDF(): this {
    this.conditions.push('kMDItemContentType == "com.adobe.pdf"')
    return this
  }

  /**
   * Filter for JSON files.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isJSON()
   *   .execute()
   * ```
   */
  public isJSON(): this {
    this.conditions.push('kMDItemContentType == "public.json"')
    return this
  }

  /**
   * Filter for YAML files.
   *
   * @returns {this} The builder instance for chaining
   *
   * @example
   * ```typescript
   * const files = await new QueryBuilder()
   *   .isYAML()
   *   .execute()
   * ```
   */
  public isYAML(): this {
    this.conditions.push('kMDItemContentType == "public.yaml"')
    return this
  }

  /**
   * Convert the query to a string format that mdfind understands.
   * Used internally by execute() and for debugging purposes.
   *
   * @returns {string} The formatted query string
   *
   * @example
   * ```typescript
   * const query = new QueryBuilder()
   *   .contentType('public.image')
   *   .hasGPS()
   *   .toString()
   * // Returns: 'kMDItemContentType == "public.image" && kMDItemLatitude != null && kMDItemLongitude != null'
   * ```
   */
  public toString(): string {
    return this.conditions.length ? this.conditions.join(` ${this.operator} `) : ''
  }

  /**
   * Execute the query and return matching file paths.
   *
   * @returns {Promise<string[]>} Array of matching file paths
   */
  public async execute(): Promise<string[]> {
    const query = this.toString()
    const options = this.options
    return mdfind(query, options)
  }
}

/**
 * @deprecated Use QueryBuilder instead. SpotlightQuery will be removed in the next major version.
 */
export const SpotlightQuery = QueryBuilder
