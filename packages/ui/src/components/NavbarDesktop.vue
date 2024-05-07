<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VMenu } from 'vuetify/components'

import type { LocaleOptions, ThemeOptions } from './CustomNavbar.vue'

import InfoDialog from './InfoDialog.vue'

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
      <span class="font-weight-bold">{{ t('navbar-title') }}</span>
    </VToolbarTitle>

    <div class="d-flex flex-row pr-4">
      <VMenu transition="slide-y-transition">
        <template #activator="{ props }">
          <VBtn v-bind="props" icon>
            <VIcon>mdi-theme-light-dark</VIcon>
            <VTooltip activator="parent" location="start" open-delay="500">
              {{ t('change-theme') }}
            </VTooltip>
          </VBtn>
        </template>
        <ThemeOptionsList
          :change-theme="changeTheme"
          :selected-theme="selectedTheme"
        />
      </VMenu>

      <VMenu transition="slide-y-transition">
        <template #activator="{ props }">
          <VBtn v-bind="props" icon>
            <VIcon>mdi-earth</VIcon>
            <VTooltip activator="parent" location="start" open-delay="500">
              {{ t('change-lang') }}
            </VTooltip>
          </VBtn>
        </template>
        <LocaleOptionsList :change-locale="changeLocale" />
      </VMenu>

      <VBtn icon @click="infoDialogVisible = true">
        <VIcon>mdi-help-circle-outline</VIcon>
        <VTooltip activator="parent" location="start" open-delay="500">
          {{ t('help') }}
        </VTooltip>
      </VBtn>
      <InfoDialog v-model="infoDialogVisible" />

      <div v-if="userStore.user" class="align-self-center">
        <VBtn :text="userStore.user?.name" class="pr-1 pl-2" />
        <VBtn icon @click="userStore.logout">
          <VIcon>mdi-logout-variant</VIcon>
          <VTooltip activator="parent" location="start" open-delay="500">
            {{ t('logout') }}
          </VTooltip>
        </VBtn>
      </div>
      <VBtn v-else icon>
        <VIcon>mdi-login-variant</VIcon>
        <VTooltip activator="parent" location="start" open-delay="500">
          {{ t('login') }}
        </VTooltip>
        <VMenu :close-on-content-click="false" activator="parent">
          <template #default="{ isActive }">
            <LoginDialog v-if="isActive" />
          </template>
        </VMenu>
      </VBtn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.navbar-container {
  width: 100%;
}
</style>

<i18n lang="yaml">
en:
  help: Help
  navbar-title: FWP Application
  change-lang: Select language
  change-theme: Select Mode
  login: Login
  logout: Logout

de:
  help: Hilfe
  navbar-title: FWP Anmeldung
  change-lang: Sprache wählen
  change-theme: Modus wählen
  login: Login
  logout: Logout
</i18n>
