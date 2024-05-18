<script setup lang="ts">
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
      prepend-icon="mdi-circle-half-full"
      title="Auto"
      @click="changeTheme('auto')"
    />
    <VDivider />
    <!-- Intentionally no i18n -->
    <VListItem
      :active="selectedTheme === 'light'"
      prepend-icon="mdi-white-balance-sunny"
      title="Light"
      @click="changeTheme('light')"
    />
    <VDivider />
    <VListItem
      :active="selectedTheme === 'dark'"
      prepend-icon="mdi-moon-waxing-crescent"
      title="Dark"
      @click="changeTheme('dark')"
    />
  </VList>
</template>
