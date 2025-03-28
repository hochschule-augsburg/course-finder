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
</script>

<template>
  <div class="d-flex justify-space-between align-center w-100">
    <RouterLink to="/">
      <VToolbarTitle :text="t('global.title')" class="ps-5" to="/" />
    </RouterLink>

    <div class="d-flex flex-row pr-4">
      <VBtn
        v-if="userStore.user?.type === 'Admin'"
        aria-label="Admin Panel"
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
          <VBtn v-bind="props" :aria-label="t('change-theme')" icon>
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
          <VBtn v-bind="props" :aria-label="t('change-lang')" icon>
            <VIcon :icon="mdiEarth" />
            <VTooltip activator="parent" location="left" open-delay="500">
              {{ t('change-lang') }}
            </VTooltip>
          </VBtn>
        </template>
        <LocaleOptionsList :change-locale="changeLocale" />
      </VMenu>

      <VMenu transition="slied-y-transition">
        <template #activator="{ props }">
          <VBtn v-bind="props" :aria-label="t('global.help')" icon>
            <VIcon :icon="mdiHelpCircleOutline" />
            <VTooltip activator="parent" location="left" open-delay="500">
              {{ t('global.help') }}
            </VTooltip>
          </VBtn>
        </template>
        <InfoOptionsList />
      </VMenu>

      <div v-if="userStore.user" class="align-self-center">
        <VBtn
          v-if="userStore.user.type === 'Student'"
          :aria-label="t('my-courses')"
          :prepend-icon="mdiAccountCircle"
          :ripple="false"
          class="pr-1 pl-2"
          to="/results"
        >
          {{ userStore.user?.name }}
          <VTooltip activator="parent" location="left" open-delay="500">
            {{ t('my-courses') }}
          </VTooltip>
        </VBtn>
        <VBtn
          v-else
          :prepend-icon="mdiAccountCircle"
          :ripple="false"
          :text="userStore.user?.name"
          class="pr-1 pl-2"
        />
        <VBtn :aria-label="t('logout')" icon @click="userStore.logout">
          <VIcon :icon="mdiLogoutVariant" />
          <VTooltip activator="parent" location="left" open-delay="500">
            {{ t('logout') }}
          </VTooltip>
        </VBtn>
      </div>
      <VBtn v-else :aria-label="t('login')" icon>
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
  change-lang: Select Language
  change-theme: Select Theme
  login: Login
  logout: Logout
  admin: Admin
  my-courses: My courses

de:
  change-lang: Sprache wählen
  change-theme: Theme wählen
  login: Login
  logout: Logout
  admin: Admin
  my-courses: Meine Kurse
</i18n>
