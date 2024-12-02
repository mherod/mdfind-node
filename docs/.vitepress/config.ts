import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'mdfind-node',
  description: 'Supercharged macOS file and metadata search using mdfind for Node.js',
  base: '/mdfind-node/',
  ignoreDeadLinks: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/' },
          { text: 'Examples', link: '/examples/' }
        ]
      },
      {
        text: 'Core Utilities',
        items: [
          { text: 'mdfind', link: '/mdfind' },
          { text: 'mdls', link: '/mdls' },
          { text: 'mdutil', link: '/mdutil' },
          { text: 'mdimport', link: '/mdimport' }
        ]
      },
      {
        text: 'Query Building',
        items: [
          { text: 'Query Builder', link: '/query-builder' },
          { text: 'Basic Operations', link: '/query-builder#basic-usage' },
          { text: 'Advanced Patterns', link: '/query-builder#complex-examples' }
        ]
      },
      {
        text: 'Additional Features',
        items: [
          { text: 'Batch Operations', link: '/batch' },
          { text: 'Extended Metadata', link: '/metadata' },
          { text: 'Content Types', link: '/content-types' },
          { text: 'Attribute Discovery', link: '/attributes' }
        ]
      },
      {
        text: 'Advanced Topics',
        items: [
          { text: 'Performance', link: '/advanced-topics#performance' },
          { text: 'Error Recovery', link: '/advanced-topics#error-recovery' },
          { text: 'Security', link: '/advanced-topics#security' },
          { text: 'Testing', link: '/advanced-topics#testing' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/mherod/mdfind-node' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Matthew Herod'
    },
    search: {
      provider: 'local'
    },
    outline: [2, 3],
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'mdfind-node' }]
  ]
})
