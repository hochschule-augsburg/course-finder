import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    globals: true,
    globalSetup: ['tests/integration/harness/globalSetup.ts'],
    include: ['tests/integration/**/*.spec.ts'],
    setupFiles: ['tests/integration/harness/setupEnv.ts'],
    testTimeout: 20000,
  },
})
