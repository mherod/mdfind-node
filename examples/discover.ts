import {
  discoverAttributes,
  getContentTypes,
  searchAttributes,
  getAttributesByCategory
} from '../src/discover.js'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
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
      if (attr.example) {
        console.log(`  Example: ${JSON.stringify(attr.example)}`)
      }
    })

    // Example 3: Get all location-related attributes
    console.log('\n3. Location-related attributes:')
    const locationAttrs = getAttributesByCategory('location')
    locationAttrs.forEach(attr => {
      console.log(`- ${attr.name}: ${attr.description}`)
      if (attr.example) {
        console.log(`  Example: ${JSON.stringify(attr.example)}`)
      }
    })

    // Example 4: Discover attributes for a specific file
    console.log('\n4. Discovering attributes for a system file:')
    try {
      const systemFile = join(homedir(), 'Library', 'Preferences', 'com.apple.finder.plist')
      const fileAttrs = discoverAttributes(systemFile)
      Object.entries(fileAttrs)
        .slice(0, 10)
        .forEach(([name, description]) => {
          console.log(`- ${name}: ${description}`)
        })
      if (Object.keys(fileAttrs).length > 10) {
        console.log(`... and ${Object.keys(fileAttrs).length - 10} more attributes`)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Could not read system file:', error.message)
      }
    }

    // Example 5: List all known attributes by category
    console.log('\n5. All known attributes by category:')
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
    if (error instanceof Error) {
      console.error('Error:', error.message)
      process.exit(1)
    }
  }
}

main()
