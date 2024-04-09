import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['prisma'].map((file) => `tests/setup/${file}.ts`),
  },
})
