import { createI18n } from 'vue-i18n'

export function i18nForTests(
  messages?: Record<string, Record<string, string>>,
) {
  return createI18n({
    fallbackWarn: false,
    legacy: false,
    messages,
    missingWarn: false,
  })
}
