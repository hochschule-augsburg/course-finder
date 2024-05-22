import type { ThemeDefinition } from 'vuetify'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

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
  icons: {
    aliases,
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'customDarkTheme',
    themes: {
      customDarkTheme,
      customLightTheme,
    },
  },
})
