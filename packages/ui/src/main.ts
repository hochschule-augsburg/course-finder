/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Components
import App from './App.vue'
// Plugins
import { registerPlugins } from './plugins'
// Styles
import './styles/main.scss'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
