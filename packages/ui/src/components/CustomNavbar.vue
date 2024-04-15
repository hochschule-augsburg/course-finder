<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { VBtn, VMenu, VToolbarTitle } from 'vuetify/components'

const userStore = useUserStore()

function handleLogout() {
  void userStore.logout()
}
</script>

<template>
  <VAppBar>
    <VToolbarTitle>
      <span>FWP Anmeldung - Fakultät Informatik</span>
    </VToolbarTitle>

    <VSpacer />

    <VBtn icon>
      <VIcon size="28">mdi-help-circle-outline</VIcon>
      <VTooltip activator="parent" location="bottom"> Hilfe </VTooltip>
    </VBtn>

    <template v-if="userStore.user">
      <VBtn>
        {{ userStore.user?.name }}
        <VIcon size="28">mdi-account-circle</VIcon>
      </VBtn>

      <VBtn @click="handleLogout">
        <VIcon size="28">mdi-logout-variant</VIcon>
        <VTooltip activator="parent" location="bottom"> Logout </VTooltip>
      </VBtn>
    </template>
    <VBtn v-else>
      <VIcon size="28">mdi-login-variant</VIcon>
      <VTooltip activator="parent" location="bottom"> Login </VTooltip>

      <VMenu :close-on-content-click="false" activator="parent">
        <template #default="{ isActive }">
          <LoginDialog v-if="isActive" />
        </template>
      </VMenu>
    </VBtn>
  </VAppBar>
</template>
