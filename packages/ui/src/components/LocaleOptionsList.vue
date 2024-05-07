<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { LocaleOptions } from './CustomNavbar.vue'

const { locale } = useI18n()

defineProps<{
  changeLocale: (newLocale: LocaleOptions) => void
}>()
</script>

<template>
  <VList>
    <VListItem
      :active="locale === 'en'"
      title="English"
      @click="changeLocale('en')"
    />
    <VDivider />
    <VListItem
      :active="locale === 'de'"
      title="Deutsch"
      @click="changeLocale('de')"
    />
  </VList>
</template>
