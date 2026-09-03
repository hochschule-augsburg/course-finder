import type { Pinia } from 'pinia'
import { createPinia, setActivePinia } from 'pinia'
import { render as vRender } from 'vitest-browser-vue'
import type { Component } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import vuetify from '@/plugins/vuetify'
import i18n from '@/plugins/i18n'

export function renderWithPlugins(
  component: Component,
  options: Parameters<typeof vRender>[1] & { pinia?: Pinia } = {},
) {
  const pinia = options.pinia ?? createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
  })

  const { pinia: _, ...renderOpts } = options

  const screen = vRender(component, {
    ...renderOpts,
    global: {
      plugins: [pinia, vuetify, i18n, router],
      ...renderOpts?.global,
    },
  })

  return {
    pinia,
    router,
    screen,
  }
}
