import { createApp } from 'vue'

import App from './App.vue'
import i18n from './plugins/i18n'
import pinia from './plugins/pinia'
import router from './plugins/router'
import vuetify from './plugins/vuetify'
import './styles/main.scss'

const app = createApp(App)

app.use(vuetify).use(pinia).use(router).use(i18n)

app.mount('#app')
