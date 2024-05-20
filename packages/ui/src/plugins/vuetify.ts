/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import type { ThemeDefinition } from 'vuetify'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

const customLightTheme: ThemeDefinition = {
  colors: {
    primary: '#ff266d',
    secondary: '#f9f9f9',
  },
  dark: false,
}

const customDarkTheme: ThemeDefinition = {
  colors: {
    primary: '#ff266d',
    secondary: '#1E1E1E',
  },
  dark: true,
}

export default createVuetify({
  theme: {
    defaultTheme: 'customDarkTheme',
    themes: {
      customDarkTheme,
      customLightTheme,
    },
  },
})
