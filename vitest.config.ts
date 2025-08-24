import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/api',
      {
        test: {
          environment: 'node',
        },
      },
      'packages/ui',
      {
        test: {
          environment: 'jsdom',
        },
      },
    ],
  },
})
