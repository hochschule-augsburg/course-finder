<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'

const userStore = useUserStore()

function handleLogout() {
  void userStore.logout()
}
</script>

<template>
  <VAppBar>
    <VToolbarTitle>
      <RouterLink class="toolbar-link" to="/">
        <span>FWP Anmeldung - Fakultät Informatik</span>
      </RouterLink>
    </VToolbarTitle>

    <VSpacer />

    <VBtn text="Admin" to="/admin" icon>
      <VIcon size="28">mdi-cog-outline</VIcon>
      <VTooltip activator="parent" location="bottom"> Admin </VTooltip>
    </VBtn>

    <VBtn text="help" icon>
      <VIcon size="28">mdi-help-circle-outline</VIcon>
      <VTooltip activator="parent" location="bottom"> Hilfe </VTooltip>
    </VBtn>

    <template v-if="userStore.user">
      <VBtn text="user">
        {{ userStore.user?.name }}
        <VIcon size="28">mdi-account-circle</VIcon>
      </VBtn>

      <VBtn text="logout" @click="handleLogout">
        <VIcon size="28">mdi-logout-variant</VIcon>
        <VTooltip activator="parent" location="bottom"> Logout </VTooltip>
      </VBtn>
    </template>
    <VBtn v-else text="login">
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
