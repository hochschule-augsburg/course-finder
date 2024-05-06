<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { useDark, useToggle } from '@vueuse/core'
import { computed, unref } from 'vue'
import { VAppBar } from 'vuetify/components'

const isDark = useDark({
  attribute: 'theme',
  selector: 'body',
  valueDark: 'dark',
  valueLight: 'light',
})

const toggleDark = useToggle(isDark)

const userStore = useUserStore()

function handleLogout() {
  void userStore.logout()
}

import { useDisplay } from 'vuetify'

const display = useDisplay()

const isMobile = computed(() => {
  return unref(display.mobile)
})
</script>

<template>
  <VAppBar>
    <template v-if="isMobile">
      <NavbarMobile />
    </template>
    <template v-else>
      <NavbarDesktop />
    </template>
  </VAppBar>
</template>

<style scoped lang="scss">
.toolbar-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
</style>
