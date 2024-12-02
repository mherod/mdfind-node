import { spawn } from 'node:child_process'
import { EventEmitter } from 'node:events'
import { homedir } from 'node:os'
import process from 'node:process'
import { clearTimeout, setTimeout, type Timeout } from 'node:timers'
import { z } from 'zod'

const SearchOptionsSchema = z.object({
  live: z.boolean().default(false),
  timeout: z.number().optional().describe('Timeout in milliseconds for live searches'),
  operator: z.enum(['&&', '||']).default('&&'),
  name: z.string().optional(),
  onlyIn: z.string().optional(),
  maxBuffer: z.number().default(1024 * 1024),
  interpret: z.boolean().default(false),
  literal: z.boolean().default(false)
})

type SearchOptions = z.infer<typeof SearchOptionsSchema>

/**
 * A fluent interface for building and executing Spotlight queries.
 */
export class QueryBuilder {
  private query: string[] = []
  private options: SearchOptions = {
    live: false,
    operator: '&&',
    maxBuffer: 1024 * 1024
  }

  /**
   * Create a new QueryBuilder instance
   */
  constructor(options?: Partial<SearchOptions>) {
    this.options = SearchOptionsSchema.parse({ ...this.options, ...options })
  }

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
    this.query.push(condition)
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
    this.query.push(`kMDItemContentType == "${type}"`)
    return this
  }

  /**
   * Set the name pattern for file matching
   */
  public named(pattern: string): this {
    this.options.name = pattern
    return this
  }

  /**
   * Set the directory to search in
   */
  public inDirectory(path: string): this {
    this.options.onlyIn = path
    return this
  }

  /**
   * Filter by creation date.
   *
   * @param {Date} date - Date to compare against
   * @returns {this} The builder instance for chaining
   */
  public createdAfter(date: Date): this {
    this.query.push(`kMDItemContentCreationDate > "${date.toISOString()}"`)
    return this
  }

  /**
   * Filter by creation date.
   *
   * @param {Date} date - Date to compare against
   * @returns {this} The builder instance for chaining
   */
  public createdBefore(date: Date): this {
    this.query.push(`kMDItemContentCreationDate < "${date.toISOString()}"`)
    return this
  }

  /**
   * Filter by modification date.
   *
   * @param {Date} date - Date to compare against
   * @returns {this} The builder instance for chaining
   */
  public modifiedAfter(date: Date): this {
    this.query.push(`kMDItemContentModificationDate > "${date.toISOString()}"`)
    return this
  }

  /**
   * Filter by modification date.
   *
   * @param {Date} date - Date to compare against
   * @returns {this} The builder instance for chaining
   */
  public modifiedBefore(date: Date): this {
    this.query.push(`kMDItemContentModificationDate < "${date.toISOString()}"`)
    return this
  }

  /**
   * Filter by last opened date.
   *
   * @param {Date} date - Date to compare against
   * @returns {this} The builder instance for chaining
   */
  public lastOpenedAfter(date: Date): this {
    this.query.push(`kMDItemLastUsedDate > "${date.toISOString()}"`)
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
    this.query.push(`kMDItemFSSize > ${bytes}`)
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
    this.query.push(`kMDItemFSSize < ${bytes}`)
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
    this.query.push(`kMDItemFSName ==[c] "*.${ext}"`)
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
    this.query.push(`kMDItemAuthors == "${name}"`)
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
    this.query.push(`kMDItemTextContent == "${text}"w`)
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
    this.query.push('kMDItemLatitude != null && kMDItemLongitude != null')
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
    this.query.push(`kMDItemAudioSampleRate >= ${sampleRate} && kMDItemAudioBitRate >= ${bitRate}`)
    return this
  }

  /**
   * Set the operator for combining conditions
   */
  public useOperator(op: '&&' | '||'): this {
    this.options.operator = op
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
    this.query.push(`(kMDItemTextContent == "${keyword}"w || kMDItemKeywords == "${keyword}")`)
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
    this.query.push(`kMDItemPixelWidth >= ${width} && kMDItemPixelHeight >= ${height}`)
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
    this.query.push('kMDItemContentType == "com.apple.application-bundle"')
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
    this.query.push('kMDItemContentType == "com.apple.systempreference"')
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
    this.query.push(`kMDItemFSLabel == ${label}`)
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
    this.query.push('kMDItemFSInvisible == 1')
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
    this.query.push(`kMDItemFSOwnerUserID == ${uid}`)
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
    this.query.push(`kMDItemEncodingApplications == "${appName}"`)
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
    this.query.push(`kMDItemMusicalGenre == "${genre}"`)
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
    this.query.push(`kMDItemRecordingYear == ${year}`)
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
    this.query.push(`kMDItemAlbum == "${name}"`)
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
    this.query.push(`kMDItemComposer == "${name}"`)
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
    this.query.push(`kMDItemAcquisitionMake == "${make}"`)
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
    this.query.push(`kMDItemAcquisitionModel == "${model}"`)
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
    this.query.push(`kMDItemISOSpeed >= ${min} && kMDItemISOSpeed <= ${max}`)
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
    this.query.push(`kMDItemFocalLength >= ${min} && kMDItemFocalLength <= ${max}`)
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
    this.query.push(`kMDItemColorSpace == "${colorSpace}"`)
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
    this.query.push(`kMDItemBitsPerSample == ${bits}`)
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
    this.query.push('kMDItemContentTypeTree == "public.text"')
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
    this.query.push('kMDItemContentTypeTree == "public.composite-content"')
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
    this.query.push('kMDItemContentTypeTree == "public.audiovisual-content"')
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
    this.query.push('kMDItemContentTypeTree == "com.apple.bundle"')
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
    this.query.push('kMDItemContentType == "net.daringfireball.markdown"')
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
    this.query.push('kMDItemContentType == "com.apple.property-list"')
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
    this.query.push('kMDItemContentType == "com.adobe.pdf"')
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
    this.query.push('kMDItemContentType == "public.json"')
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
    this.query.push('kMDItemContentType == "public.yaml"')
    return this
  }

  /**
   * Convert the query to a string
   */
  public toString(): string {
    const query = this.query.length ? this.query.join(` ${this.options.operator} `) : ''
    const args: string[] = []

    if (this.options.name) {
      args.push(`kMDItemFSName ==[c] "${this.options.name}"`)
    }

    return args.length
      ? query
        ? `${query} ${this.options.operator} ${args.join(' ')}`
        : args.join(' ')
      : query
  }

  /**
   * Execute the search query
   */
  public execute(): Promise<string[]> {
    const args = [...this.query]
    const command = 'mdfind'

    // Expand home directory for execution
    if (this.options.onlyIn) {
      args.push('-onlyin', this.options.onlyIn.replace(/^~/, homedir()))
    }

    if (this.options.live) {
      return new Promise((resolve, reject) => {
        const results: string[] = []
        const emitter = new EventEmitter()
        const child = spawn(command, ['-live', ...args])
        let timeoutId: Timeout | undefined

        // Set up timeout if specified
        if (typeof this.options.timeout === 'number') {
          timeoutId = setTimeout(() => {
            child.kill()
            emitter.emit('done')
          }, this.options.timeout)
        }

        child.stdout.setEncoding('utf8')
        child.stdout.on('data', (data: string) => {
          const lines = data.trim().split('\n')
          for (const line of lines) {
            if (line.length > 0) {
              results.push(line)
              emitter.emit('result', line)
            }
          }
        })

        child.stderr.on('data', (data: string) => {
          reject(new Error(`mdfind error: ${data}`))
        })

        child.on('close', (code: number | null) => {
          if (code !== null && code !== 0) {
            reject(new Error(`mdfind exited with code ${code}`))
          }
          emitter.emit('done')
        })

        emitter.on('done', () => {
          if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
          }
          resolve(results)
        })

        // Handle process termination
        const cleanup = (): void => {
          child.kill()
          if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
          }
        }

        process.on('SIGINT', cleanup)
        process.on('SIGTERM', cleanup)
        process.on('exit', cleanup)
      })
    }

    return new Promise((resolve, reject) => {
      const results: string[] = []
      const child = spawn(command, args)

      child.stdout.setEncoding('utf8')
      child.stdout.on('data', (data: string) => {
        const lines = data.trim().split('\n')
        for (const line of lines) {
          if (line.length > 0) {
            results.push(line)
          }
        }
      })

      child.stderr.on('data', (data: string) => {
        reject(new Error(`mdfind error: ${data}`))
      })

      child.on('close', (code: number | null) => {
        if (code !== null && code !== 0) {
          reject(new Error(`mdfind exited with code ${code}`))
        }
        resolve(results)
      })
    })
  }

  /**
   * Execute the search query with live updates
   * @param onResult Callback function that receives each result as it arrives
   * @param onComplete Optional callback function called when the search completes
   */
  public executeLive(
    onResult: (result: string) => void,
    onComplete?: (results: string[]) => void
  ): Promise<void> {
    const args = [...this.query]
    const command = 'mdfind'
    const results: string[] = []
    const emitter = new EventEmitter()
    const child = spawn(command, ['-live', ...args])
    let timeoutId: Timeout | undefined

    // Set up timeout if specified
    if (typeof this.options.timeout === 'number') {
      timeoutId = setTimeout(() => {
        child.kill()
        emitter.emit('done')
      }, this.options.timeout)
    }

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', (data: string) => {
      const lines = data.trim().split('\n')
      for (const line of lines) {
        if (line.length > 0) {
          results.push(line)
          onResult(line)
        }
      }
    })

    child.stderr.on('data', (data: string) => {
      throw new Error(`mdfind error: ${data}`)
    })

    child.on('close', (code: number | null) => {
      if (code !== null && code !== 0) {
        throw new Error(`mdfind exited with code ${code}`)
      }
      emitter.emit('done')
    })

    emitter.on('done', () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      if (onComplete !== undefined) {
        onComplete(results)
      }
    })

    // Handle process termination
    const cleanup = (): void => {
      child.kill()
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)
    process.on('exit', cleanup)

    return Promise.resolve()
  }

  /**
   * Filter by file types using name patterns
   */
  public withFileTypes(types: string[]): this {
    const pattern = `*.{${types.join(',')}}`
    return this.named(pattern)
  }
}
/**
 * @deprecated Use QueryBuilder instead. SpotlightQuery will be removed in the next major version.
 */
export const SpotlightQuery = QueryBuilder
