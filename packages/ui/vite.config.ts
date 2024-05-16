/// <reference types="vitest" />
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import ViteFonts from 'unplugin-fonts/vite'
// Plugins
import VueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import VueRouter from 'unplugin-vue-router/vite'
// Utilities
import { defineConfig } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import vueJsxPlugin from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    holdUntilCrawlEnd: false,
    include: [
      '@vueuse/core',
      'vue-pdf-embed',
      'lodash-es',
      'vuetify/lib/directives/index.mjs',
    ],
  },
  define: { 'process.env': {} },
  plugins: [
    VueRouter(),
    Vue({
      template: { transformAssetUrls },
    }),
    vueJsxPlugin(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
    }),
    Components(),
    VueI18nPlugin({
      include: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './src/locales/**',
      ),
    }),
    ViteFonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900',
          },
        ],
      },
    }),
    VueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
    headers: {
      'x-content-type-options': 'nosniff',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'content-security-policy': "frame-ancestors 'self';",
    },
  },
  test: {
    // perhaps changes later to jsdom but happydom is faster
    environment: 'jsdom',
    globalSetup: ['tests/test-setup/globalSetup.ts'],
    globals: true,
    server: {
      deps: {
        inline: ['vuetify'],
      },
    },
    setupFiles: ['trpcMock.ts', 'ResizeObserverPolyfill.ts'].map(
      (file) => `tests/test-setup/${file}`,
    ),
  },
})
