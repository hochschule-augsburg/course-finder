import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['tests/integration/**', 'node_modules/**'],
    globals: true,
    includeSource: ['src/domain/enroll/**/*.ts'],
    setupFiles: ['prisma', 'env'].map((file) => `tests/setup/${file}.ts`),
  },
})
