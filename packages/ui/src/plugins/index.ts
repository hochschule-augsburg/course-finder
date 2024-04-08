import type { App } from 'vue'

import { VueQueryPlugin } from 'vue-query'

import router from '../router'
import { i18n } from './i18n'
import pinia from './pinia'
import vuetify from './vuetify'

export function registerPlugins(app: App) {
  app.use(vuetify).use(pinia).use(router).use(VueQueryPlugin).use(i18n)
}
