<script setup lang="ts">
import {
  mdiCircleHalfFull,
  mdiMoonWaxingCrescent,
  mdiWhiteBalanceSunny,
} from '@mdi/js'
import { VDivider, VList, VListItem } from 'vuetify/components'

import type { ThemeOptions } from './CustomNavbar.vue'

defineProps<{
  changeTheme: (newTheme: ThemeOptions) => void
  selectedTheme: ThemeOptions
}>()
</script>

<template>
  <VList>
    <VListItem
      :active="selectedTheme === 'auto'"
      :prepend-icon="mdiCircleHalfFull"
      title="Auto"
      @click="changeTheme('auto')"
    />
    <VDivider />
    <!-- Intentionally no i18n -->
    <VListItem
      :active="selectedTheme === 'light'"
      :prepend-icon="mdiWhiteBalanceSunny"
      title="Light"
      @click="changeTheme('light')"
    />
    <VDivider />
    <VListItem
      :active="selectedTheme === 'dark'"
      :prepend-icon="mdiMoonWaxingCrescent"
      title="Dark"
      @click="changeTheme('dark')"
    />
  </VList>
</template>
