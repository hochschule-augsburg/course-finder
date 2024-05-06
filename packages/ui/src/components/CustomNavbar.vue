<script setup lang="ts">
import { computed, unref } from 'vue'
import { useDisplay } from 'vuetify'
import { VAppBar } from 'vuetify/components'

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
