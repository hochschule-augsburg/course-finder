<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VMenu, VToolbarTitle } from 'vuetify/components'

import type { LocaleOptions, ThemeOptions } from './CustomNavbar.vue'

defineProps<{
  changeLocale: (newLocale: LocaleOptions) => void
  changeTheme: (newTheme: ThemeOptions) => void
  selectedTheme: ThemeOptions
}>()
const { t } = useI18n()
const userStore = useUserStore()
const infoDialogVisible = ref(false)
</script>

<template>
  <div class="d-flex justify-space-between align-center navbar-container">
    <VToolbarTitle class="ps-5">
      <span class="font-weight-bold">{{ t('nav-title') }}</span>
    </VToolbarTitle>

    <VMenu transition="slide-y-transition">
      <template #activator="{ props }">
        <VBtn
          class="mr-1"
          icon="mdi-dots-vertical"
          size="large"
          v-bind="props"
        />
      </template>

      <VList>
        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VListItem
              v-bind="props"
              :title="t('change-theme')"
              class="justify-start"
              prepend-icon="mdi-theme-light-dark"
            />
          </template>
          <ThemeOptionsList
            :change-theme="changeTheme"
            :selected-theme="selectedTheme"
          />
        </VMenu>

        <VDivider />

        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VListItem
              v-bind="props"
              :title="t('change-lang')"
              prepend-icon="mdi-earth"
            />
          </template>
          <LocaleOptionsList :change-locale="changeLocale" />
        </VMenu>

        <VDivider />

        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VListItem
              v-bind="props"
              :title="t('help')"
              prepend-icon="mdi-help-circle-outline"
              @click="infoDialogVisible = true"
            />
          </template>
          <InfoDialog v-model="infoDialogVisible" />
        </VMenu>

        <VDivider />

        <VListItem
          v-if="userStore.user"
          :subtitle="userStore.user.name"
          :title="t('logout')"
          prepend-icon="mdi-logout-variant"
          @click="userStore.logout"
        />
        <VMenu
          v-else
          :close-on-content-click="false"
          transition="slide-y-transition"
        >
          <template #activator="{ props }">
            <VListItem
              v-bind="props"
              :title="t('login')"
              prepend-icon="mdi-login-variant"
            />
          </template>
          <LoginDialog />
        </VMenu>
      </VList>
    </VMenu>
  </div>
</template>

<style scoped lang="scss">
.selected {
  color: rgb(var(--v-theme-primary));
}

.navbar-container {
  width: 100%;
}
</style>

<i18n lang="yaml">
en:
  help: Help
  nav-title: FWP Application
  change-lang: Select language
  change-theme: Select Mode
  login: Login
  logout: Logout

de:
  help: Hilfe
  nav-title: FWP Anmeldung
  change-lang: Sprache wählen
  change-theme: Modus wählen
  login: Login
  logout: Logout
</i18n>
