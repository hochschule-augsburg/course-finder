import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
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
])
