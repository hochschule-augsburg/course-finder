import type { useI18n as originalUseI18n } from 'vue-i18n'

import messages from '@intlify/unplugin-vue-i18n/messages'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  fallbackLocale: 'en',
  // fallbackWarn: false,
  locale: 'de',
  messages,
  // missingWarn: false,
})

declare module 'vue-i18n' {
  export function useI18n(): ReturnType<
    typeof originalUseI18n<{ messages: typeof messages }, 'de' | 'en'>
  >
}

export default i18n
