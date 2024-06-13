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

export function getLocalISOString(date: Date | string) {
  const d = new Date(date)

  const localOffset = d.getTimezoneOffset() * 60000
  const localISOString = new Date(d.getTime() - localOffset)
    .toISOString()
    .slice(0, 16)

  return localISOString
}
