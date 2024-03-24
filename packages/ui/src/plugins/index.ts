import type { App } from 'vue'

import { VueQueryPlugin } from 'vue-query'

import router from '../router'
import vuetify from './vuetify'

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(VueQueryPlugin)
}
