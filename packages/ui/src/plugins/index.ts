import type { App } from 'vue'

import router from '../router'
import vuetify from './vuetify'

export function registerPlugins(app: App) {
  app
    .use(vuetify)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .use(router)
}
