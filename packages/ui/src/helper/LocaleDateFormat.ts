import type { Locale } from 'date-fns'

import { de, enGB, enUS } from 'date-fns/locale'

export function getDateFnsLocale(locale: string): Locale {
  const dateFnsLocales: Record<string, Locale> = {
    de: de,
    en: enGB,
    // for testing
    'en-US': enUS,
  }
  return dateFnsLocales[locale] ?? enGB
}
