/* eslint-disable no-console */
import { getAttributesByCategory, getContentTypes, searchAttributes } from 'mdfind-node'

async function main(): Promise<void> {
  try {
    // Example 1: List all known content types
    console.log('\n1. Available content types:')
    const contentTypes = getContentTypes()
    Object.entries(contentTypes).forEach(([type, description]) => {
      console.log(`- ${type}: ${description}`)
    })

    // Example 2: Search for attributes related to images
    console.log('\n2. Searching for image-related attributes:')
    const imageAttrs = searchAttributes('image')
    imageAttrs.forEach(attr => {
      console.log(`- ${attr.name}: ${attr.description}`)
    })

    // Example 3: Get all location-related attributes
    console.log('\n3. Location-related attributes:')
    const locationAttrs = getAttributesByCategory('location')
    locationAttrs.forEach(attr => {
      console.log(`- ${attr.name}: ${attr.description}`)
    })

    // Example 4: List attributes by category
    console.log('\n4. Attributes by category:')
    const categories = ['general', 'document', 'media', 'image', 'audio', 'location'] as const
    for (const category of categories) {
      const attrs = getAttributesByCategory(category)
      if (attrs.length > 0) {
        console.log(`\n${category.toUpperCase()}:`)
        attrs.forEach(attr => {
          console.log(`- ${attr.name}: ${attr.description}`)
        })
      }
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

void main().catch(err => console.error('Unhandled error:', err))
