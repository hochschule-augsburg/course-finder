<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { VToolbarTitle } from 'vuetify/components'

async function handleLogout() {
  await useUserStore().logout()
}
</script>

<template>
  <VAppBar>
    <VToolbarTitle>
      <span>FWP Anmeldung - Fakultät Informatik</span>
    </VToolbarTitle>

    <VSpacer />

    <VBtn icon>
      <VIcon size="28">mdi-account-circle</VIcon>
      <VTooltip activator="parent" location="bottom"> Administrator </VTooltip>
    </VBtn>

    <VBtn icon>
      <VIcon size="28">mdi-help-circle-outline</VIcon>
      <VTooltip activator="parent" location="bottom"> Hilfe </VTooltip>
    </VBtn>

    <VBtn icon @click="handleLogout">
      <VIcon size="28">mdi-logout-variant</VIcon>
      <VTooltip activator="parent" location="bottom"> Logout </VTooltip>
    </VBtn>
  </VAppBar>
</template>
