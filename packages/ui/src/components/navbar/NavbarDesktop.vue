<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import {
  mdiAccountCircle,
  mdiEarth,
  mdiHelpCircleOutline,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiShieldCrownOutline,
  mdiThemeLightDark,
} from '@mdi/js'
import { inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VIcon, VMenu, VToolbarTitle, VTooltip } from 'vuetify/components'

import type { LocaleOptions, ThemeOptions } from './CustomNavbar.vue'

defineProps<{
  changeLocale: (newLocale: LocaleOptions) => void
  changeTheme: (newTheme: ThemeOptions) => void
  selectedTheme: ThemeOptions
}>()
const { t } = useI18n()

const userStore = useUserStore()
const infoDialogVisible = ref(false)

const startOnboarding = inject<() => void>('startOnboarding') // TODO tmp
</script>

<template>
  <div class="d-flex justify-space-between align-center w-100">
    <RouterLink to="/">
      <VToolbarTitle :text="t('global.title')" class="ps-5" to="/" />
    </RouterLink>

    <div class="d-flex flex-row pr-4">
      <VBtn
        v-if="userStore.user?.type === 'Admin'"
        text="Admin"
        to="/admin"
        icon
      >
        <VIcon :icon="mdiShieldCrownOutline" />
        <VTooltip activator="parent" location="left" open-delay="500">
          {{ t('admin') }}
        </VTooltip>
      </VBtn>

      <VMenu transition="slide-y-transition">
        <template #activator="{ props }">
          <VBtn v-bind="props" icon>
            <VIcon :icon="mdiThemeLightDark" />
            <VTooltip activator="parent" location="left" open-delay="500">
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
            <VIcon :icon="mdiEarth" />
            <VTooltip activator="parent" location="left" open-delay="500">
              {{ t('change-lang') }}
            </VTooltip>
          </VBtn>
        </template>
        <LocaleOptionsList :change-locale="changeLocale" />
      </VMenu>

      <VBtn icon @click="startOnboarding">
        <VIcon :icon="mdiHelpCircleOutline" />
        <VTooltip activator="parent" location="left" open-delay="500">
          {{ t('help') }}
        </VTooltip>
      </VBtn>
      <InfoDialog v-model="infoDialogVisible" />

      <div v-if="userStore.user" class="align-self-center">
        <VBtn
          :prepend-icon="mdiAccountCircle"
          :ripple="false"
          :text="userStore.user?.name"
          class="pr-1 pl-2"
        />
        <VBtn icon @click="userStore.logout">
          <VIcon :icon="mdiLogoutVariant" />
          <VTooltip activator="parent" location="left" open-delay="500">
            {{ t('logout') }}
          </VTooltip>
        </VBtn>
      </div>
      <VBtn v-else icon>
        <VIcon :icon="mdiLoginVariant" />
        <VTooltip activator="parent" location="left" open-delay="500">
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

<i18n lang="yaml">
en:
  help: Help
  change-lang: Select Language
  change-theme: Select Theme
  login: Login
  logout: Logout
  admin: Admin

de:
  help: Hilfe
  change-lang: Sprache wählen
  change-theme: Theme wählen
  login: Login
  logout: Logout
  admin: Admin
</i18n>
