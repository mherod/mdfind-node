import { describe, expect, it } from 'vitest'
import { QueryBuilder } from '../src/query-builder.js'

describe('QueryBuilder', () => {
  describe('toString()', () => {
    it('should build a simple content type query', () => {
      const query = new QueryBuilder().contentType('public.image').toString()
      expect(query).toBe('kMDItemContentType == "public.image"')
    })

    it('should combine multiple conditions with AND by default', () => {
      const query = new QueryBuilder()
        .contentType('public.image')
        .largerThan(1024 * 1024)
        .toString()
      expect(query).toBe('kMDItemContentType == "public.image" && kMDItemFSSize > 1048576')
    })

    it('should use OR operator when specified', () => {
      const query = new QueryBuilder()
        .useOperator('||')
        .extension('jpg')
        .extension('png')
        .toString()
      expect(query).toBe('kMDItemFSName ==[c] "*.jpg" || kMDItemFSName ==[c] "*.png"')
    })

    it('should handle empty conditions', () => {
      const query = new QueryBuilder().toString()
      expect(query).toBe('')
    })
  })

  describe('options', () => {
    it('should set directory option', () => {
      const builder = new QueryBuilder().inDirectory('~/Documents')
      expect(builder['options'].onlyIn).toBe('~/Documents')
    })

    it('should set maxBuffer option', () => {
      const builder = new QueryBuilder().maxBuffer(1024 * 1024)
      expect(builder['options'].maxBuffer).toBe(1024 * 1024)
    })

    it('should enable interpretation', () => {
      const builder = new QueryBuilder().interpret()
      expect(builder['options'].interpret).toBe(true)
    })

    it('should enable literal mode', () => {
      const builder = new QueryBuilder().literal()
      expect(builder['options'].literal).toBe(true)
    })
  })

  describe('specialized methods', () => {
    it('should create text query', () => {
      const query = new QueryBuilder().isText().toString()
      expect(query).toBe('kMDItemContentTypeTree == "public.text"')
    })

    it('should create audiovisual query', () => {
      const query = new QueryBuilder().isAudiovisual().toString()
      expect(query).toBe('kMDItemContentTypeTree == "public.audiovisual-content"')
    })

    it('should create bundle query', () => {
      const query = new QueryBuilder().isBundle().toString()
      expect(query).toBe('kMDItemContentTypeTree == "com.apple.bundle"')
    })

    it('should create PDF query', () => {
      const query = new QueryBuilder().isPDF().toString()
      expect(query).toBe('kMDItemContentType == "com.adobe.pdf"')
    })
  })

  describe('date methods', () => {
    it('should create createdAfter query', () => {
      const date = new Date('2024-01-01')
      const query = new QueryBuilder().createdAfter(date).toString()
      expect(query).toBe(`kMDItemContentCreationDate > "${date.toISOString()}"`)
    })

    it('should create modifiedAfter query', () => {
      const date = new Date('2024-01-01')
      const query = new QueryBuilder().modifiedAfter(date).toString()
      expect(query).toBe(`kMDItemContentModificationDate > "${date.toISOString()}"`)
    })

    it('should create lastOpenedAfter query', () => {
      const date = new Date('2024-01-01')
      const query = new QueryBuilder().lastOpenedAfter(date).toString()
      expect(query).toBe(`kMDItemLastUsedDate > "${date.toISOString()}"`)
    })
  })
})
