import { z } from 'zod'
import type { MetadataResult } from '../core/spotlight.js'
import { XMPDataSchema } from './xmp.js'

/**
 * Transform raw Spotlight metadata into XMP format.
 * Maps Spotlight attributes to their corresponding XMP fields.
 *
 * @param {MetadataResult} metadata - Raw Spotlight metadata
 * @returns {z.infer<typeof XMPDataSchema>} Transformed XMP metadata
 *
 * @internal
 */
export function transformToXMP(metadata: MetadataResult): z.infer<typeof XMPDataSchema> {
  const transformed = {
    title: metadata.kMDItemTitle as string | undefined,
    description: metadata.kMDItemDescription as string | undefined,
    creator: Array.isArray(metadata.kMDItemAuthors)
      ? metadata.kMDItemAuthors[0]
      : (metadata.kMDItemAuthors as string | undefined),
    subject: metadata.kMDItemKeywords as string[] | undefined,
    createDate: metadata.kMDItemContentCreationDate as Date | undefined,
    modifyDate: metadata.kMDItemContentModificationDate as Date | undefined,
    metadataDate: metadata.kMDItemAttributeChangeDate as Date | undefined,
    copyrightNotice: metadata.kMDItemCopyright as string | undefined,
    rights: metadata.kMDItemRights as string | undefined,
    webStatement: metadata.kMDItemURL as string | undefined
  }

  return XMPDataSchema.parse(transformed)
}
