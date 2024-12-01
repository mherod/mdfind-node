import { describe, expect, it } from 'vitest'
import {
  BasicMetadataSchema,
  ExifDataSchema,
  MdfindOptionsSchema,
  MdlsOptionsSchema,
  MdutilOptionsSchema,
  XMPDataSchema
} from '../src/schemas/index.js'

describe('Schemas', () => {
  describe('BasicMetadataSchema', () => {
    it('should validate complete metadata', () => {
      const metadata = {
        name: 'example.pdf',
        contentType: 'com.adobe.pdf',
        kind: 'PDF Document',
        size: 1024,
        created: new Date('2024-01-01').toISOString(),
        modified: new Date('2024-01-02').toISOString(),
        lastOpened: new Date('2024-01-03').toISOString()
      }
      const result = BasicMetadataSchema.parse(metadata)
      expect(result.name).toBe('example.pdf')
      expect(result.contentType).toBe('com.adobe.pdf')
      expect(result.size).toBe(1024)
      expect(result.created instanceof Date).toBe(true)
      expect(result.modified instanceof Date).toBe(true)
      expect(result.lastOpened instanceof Date).toBe(true)
    })

    it('should handle minimal metadata', () => {
      const metadata = {
        name: 'file.txt'
      }
      const result = BasicMetadataSchema.parse(metadata)
      expect(result.name).toBe('file.txt')
      expect(result.contentType).toBeUndefined()
      expect(result.size).toBeUndefined()
    })
  })

  describe('ExifDataSchema', () => {
    it('should validate complete EXIF data', () => {
      const exif = {
        make: 'Canon',
        model: 'EOS R5',
        lens: 'RF 24-70mm F2.8L IS USM',
        exposureTime: 0.001,
        fNumber: 2.8,
        isoSpeedRatings: 100,
        focalLength: 50,
        gpsLatitude: 37.7749,
        gpsLongitude: -122.4194,
        gpsAltitude: 100
      }
      const result = ExifDataSchema.parse(exif)
      expect(result.make).toBe('Canon')
      expect(result.model).toBe('EOS R5')
      expect(result.fNumber).toBe(2.8)
      expect(result.gpsLatitude).toBe(37.7749)
    })

    it('should handle partial EXIF data', () => {
      const exif = {
        make: 'Apple',
        model: 'iPhone 15 Pro'
      }
      const result = ExifDataSchema.parse(exif)
      expect(result.make).toBe('Apple')
      expect(result.model).toBe('iPhone 15 Pro')
      expect(result.fNumber).toBeUndefined()
    })
  })

  describe('XMPDataSchema', () => {
    it('should validate complete XMP data', () => {
      const xmp = {
        title: 'Test Image',
        description: 'A test image',
        creator: 'John Doe',
        subject: ['test', 'image'],
        createDate: new Date('2024-01-01').toISOString(),
        modifyDate: new Date('2024-01-02').toISOString(),
        metadataDate: new Date('2024-01-03').toISOString(),
        copyrightNotice: 'All rights reserved',
        rights: 'Copyright 2024',
        webStatement: 'https://example.com/license'
      }
      const result = XMPDataSchema.parse(xmp)
      expect(result.title).toBe('Test Image')
      expect(result.creator).toBe('John Doe')
      expect(result.subject).toEqual(['test', 'image'])
      expect(result.createDate instanceof Date).toBe(true)
    })

    it('should handle partial XMP data', () => {
      const xmp = {
        title: 'Test Image',
        creator: 'John Doe'
      }
      const result = XMPDataSchema.parse(xmp)
      expect(result.title).toBe('Test Image')
      expect(result.creator).toBe('John Doe')
      expect(result.subject).toBeUndefined()
    })
  })

  describe('MdfindOptionsSchema', () => {
    it('should validate complete options', () => {
      const options = {
        onlyIn: '~/Documents',
        name: '*.pdf',
        live: true,
        count: true,
        attr: 'kMDItemDisplayName',
        smartFolder: 'test',
        nullSeparator: true,
        maxBuffer: 1024 * 1024,
        reprint: true,
        literal: true,
        interpret: true
      }
      const result = MdfindOptionsSchema.parse(options)
      expect(result.onlyIn).toBe('~/Documents')
      expect(result.name).toBe('*.pdf')
      expect(result.maxBuffer).toBe(1024 * 1024)
    })

    it('should provide default values', () => {
      const result = MdfindOptionsSchema.parse({})
      expect(result.live).toBe(false)
      expect(result.count).toBe(false)
      expect(result.nullSeparator).toBe(false)
      expect(result.maxBuffer).toBe(1024 * 512)
      expect(result.reprint).toBe(false)
      expect(result.literal).toBe(false)
      expect(result.interpret).toBe(false)
    })
  })

  describe('MdlsOptionsSchema', () => {
    it('should validate complete options', () => {
      const options = {
        attributes: ['kMDItemDisplayName', 'kMDItemContentType'],
        raw: true,
        nullMarker: 'NULL'
      }
      const result = MdlsOptionsSchema.parse(options)
      expect(result.attributes).toEqual(['kMDItemDisplayName', 'kMDItemContentType'])
      expect(result.raw).toBe(true)
      expect(result.nullMarker).toBe('NULL')
    })

    it('should provide default values', () => {
      const result = MdlsOptionsSchema.parse({})
      expect(result.attributes).toEqual([])
      expect(result.raw).toBe(false)
      expect(result.nullMarker).toBe('(null)')
    })
  })

  describe('MdutilOptionsSchema', () => {
    it('should validate options', () => {
      const options = {
        verbose: true
      }
      const result = MdutilOptionsSchema.parse(options)
      expect(result.verbose).toBe(true)
    })

    it('should provide default values', () => {
      const result = MdutilOptionsSchema.parse({})
      expect(result.verbose).toBe(false)
    })
  })
})
