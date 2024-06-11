import type { ThemeDefinition } from 'vuetify'

import DateFnsAdapter from '@date-io/date-fns'
import { de as dateDe, enGB as dateEnGB } from 'date-fns/locale'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { de, en } from 'vuetify/locale'
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
  date: {
    adapter: DateFnsAdapter,
    locale: {
      de: dateDe,
      en: dateEnGB,
    },
  },
  icons: {
    aliases,
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  locale: {
    fallback: 'en',
    locale: 'de',
    messages: { de, en },
  },
  theme: {
    defaultTheme: 'customDarkTheme',
    themes: {
      customDarkTheme,
      customLightTheme,
    },
  },
})
