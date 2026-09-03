import { defineConfig, mergeConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import viteConfig from './vite.config'

// Remove node-specific test config before merging
const { test: _nodeTestConfig, ...baseViteConfig } = viteConfig as any

export default mergeConfig(
  baseViteConfig,
  defineConfig({
    test: {
      name: 'browser',
      include: ['tests/browser/**/*.browser.spec.ts'],
      setupFiles: ['tests/browser/support/browserSetup.ts'],
      globalSetup: [],
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium' }],
        headless: true,
        viewport: {
          width: 1280,
          height: 800,
        },
      },
    },
  }),
)
