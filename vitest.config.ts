import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/vitest.config.*',
        '**/{karma,rollup,webpack,vite,tsup}.config.*',
        '**/.{eslint,prettier}rc.{js,cjs,yml}',
        '**/{examples,scripts}/**'
      ]
    },
    environment: 'node',
    include: ['test/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 20000
  }
})
