<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import {
  mdiAccount,
  mdiEarth,
  mdiHelpCircleOutline,
  mdiLoginVariant,
  mdiLogoutVariant,
  mdiMenu,
  mdiShieldCrownOutline,
  mdiThemeLightDark,
} from '@mdi/js'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VDivider,
  VList,
  VListItem,
  VMenu,
  VToolbarTitle,
} from 'vuetify/components'

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
      <VToolbarTitle :text="t('global.title')" class="ps-5" />
    </RouterLink>

    <VMenu transition="slide-y-transition">
      <template #activator="{ props }">
        <VBtn
          :aria-label="t('menu')"
          :icon="mdiMenu"
          class="mr-1"
          size="large"
          v-bind="props"
        />
      </template>

      <VList>
        <VListItem
          v-if="userStore.user?.type === 'Admin'"
          :prepend-icon="mdiShieldCrownOutline"
          :title="t('admin')"
          to="/admin"
        />

        <VDivider v-if="userStore.user?.type === 'Admin'" />

        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VListItem
              v-bind="props"
              :prepend-icon="mdiThemeLightDark"
              :title="t('change-theme')"
              class="justify-start"
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
              :prepend-icon="mdiEarth"
              :title="t('change-lang')"
            />
          </template>
          <LocaleOptionsList :change-locale="changeLocale" />
        </VMenu>

        <VDivider />

        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VListItem
              v-bind="props"
              :prepend-icon="mdiHelpCircleOutline"
              :title="t('help')"
            />
          </template>
          <InfoOptionsList />
        </VMenu>

        <VDivider />

        <VListItem
          v-if="userStore.user?.type === 'Student'"
          :prepend-icon="mdiAccount"
          :title="t('my-courses')"
          to="/results"
        />

        <VDivider v-if="userStore.user?.type === 'Student'" />

        <VListItem
          v-if="userStore.user"
          :prepend-icon="mdiLogoutVariant"
          :subtitle="userStore.user.name"
          :title="t('logout')"
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
              :prepend-icon="mdiLoginVariant"
              :title="t('login')"
            />
          </template>
          <LoginDialog />
        </VMenu>
      </VList>
    </VMenu>
  </div>
</template>

<i18n lang="yaml">
en:
  menu: Menu
  help: Help
  change-lang: Select Language
  change-theme: Select Theme
  login: Login
  logout: Logout
  admin: Admin
  my-courses: My courses

de:
  menu: Menü
  help: Hilfe
  change-lang: Sprache wählen
  change-theme: Theme wählen
  login: Login
  logout: Logout
  admin: Admin
  my-courses: Meine Kurse
</i18n>
