<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay, useTheme } from 'vuetify'

export type ThemeOptions = 'auto' | 'dark' | 'light'
export type LocaleOptions = 'de' | 'en'

const { mobile } = useDisplay()

const { locale } = useI18n()
const theme = useTheme()

const selectedTheme = ref<ThemeOptions>('auto')

const themes = {
  auto: getPreferredColorScheme(),
  dark: 'customDarkTheme',
  light: 'customLightTheme',
}

function getPreferredColorScheme() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
  return prefersDarkMode ? 'customDarkTheme' : 'customLightTheme'
}

function changeTheme(newTheme: ThemeOptions) {
  selectedTheme.value = newTheme
  theme.global.name.value = themes[newTheme]
  localStorage.setItem('theme', newTheme)
}

function changeLocale(newLocale: LocaleOptions) {
  locale.value = newLocale
  window.localStorage.setItem('locale', newLocale)
}

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const savedTheme = localStorage.getItem('theme') as ThemeOptions
  const savedLocale = window.localStorage.getItem('locale')
  const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')

  if (savedTheme) {
    selectedTheme.value = savedTheme
    theme.global.name.value = themes[savedTheme]
  } else {
    theme.global.name.value = themes['auto']
  }

  if (savedLocale) {
    locale.value = savedLocale
  } else {
    locale.value = navigator.language
  }

  darkModePreference.addEventListener('change', (e) => {
    if (selectedTheme.value === 'auto') {
      theme.global.name.value = e.matches ? themes['dark'] : themes['light']
    }
  })
})
</script>

<template>
  <VAppBar>
    <template v-if="mobile">
      <NavbarMobile
        :change-locale="changeLocale"
        :change-theme="changeTheme"
        :selected-theme="selectedTheme"
      />
    </template>
    <template v-else>
      <NavbarDesktop
        :change-locale="changeLocale"
        :change-theme="changeTheme"
        :selected-theme="selectedTheme"
      />
    </template>
  </VAppBar>
</template>

<style scoped lang="scss">
.toolbar-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
</style>
