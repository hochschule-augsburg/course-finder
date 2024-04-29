/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
// Composables
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides

const customLightTheme = {
  colors: {
    primary: '#ff266d',
  },
  dark: false,
}

const customDarkTheme = {
  colors: {
    primary: '#ff266d',
    secondary: '#1E1E1E',
  },
  dark: true,
}

export default createVuetify({
  theme: {
    defaultTheme: 'customLightTheme',
    themes: {
      customDarkTheme,
      customLightTheme,
    },
  },
})
