<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { VBtn, VMenu, VSpacer } from 'vuetify/components'

const { locale, t } = useI18n()

const userStore = useUserStore()
const activeButtonTheme = ref<string>()
const activeButtonLanguage = ref<string>()
const drawer = ref(false)

function handleLogout() {
  void userStore.logout()
}

const theme = useTheme()

onMounted(() => {
  let savedTheme = null
  try {
    savedTheme = localStorage.getItem('theme')
  } catch (error) {
    // Handle error accessing localStorage
    console.error('Error accessing localStorage:', error)
  }
  if (savedTheme) {
    theme.global.name.value = savedTheme
  } else {
    // Use preferred color scheme of user's browser
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    theme.global.name.value = prefersDarkMode
      ? 'customDarkTheme'
      : 'customLightTheme'
  }
})

function changeToDarkmode() {
  theme.global.name.value = 'customDarkTheme'
  activeButtonTheme.value = 'dark'
  try {
    // Save selected theme to localStorage
    localStorage.setItem('theme', 'customDarkTheme')
  } catch (error) {
    // Handle error accessing localStorage
    console.error('Error accessing localStorage:', error)
  }
}

function changeToLightmode() {
  theme.global.name.value = 'customLightTheme'
  activeButtonTheme.value = 'light'
  try {
    // Save selected theme to localStorage
    localStorage.setItem('theme', 'customLightTheme')
  } catch (error) {
    // Handle error accessing localStorage
    console.error('Error accessing localStorage:', error)
  }
}

function changeToAutomode() {
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches
  theme.global.name.value = prefersDarkMode
    ? 'customDarkTheme'
    : 'customLightTheme'
  const currenttheme = theme.global.name.value
  activeButtonTheme.value = 'auto'
  try {
    // Save selected theme to localStorage
    localStorage.setItem('theme', currenttheme)
  } catch (error) {
    // Handle error accessing localStorage
    console.error('Error accessing localStorage:', error)
  }
}

function changeToEnglish() {
  locale.value = 'en'
  activeButtonLanguage.value = 'en'
  try {
    window.localStorage.setItem('language', 'en')
  } catch (error) {
    console.error('Error accessing localStorage:', error)
  }
}

function changeToGerman() {
  locale.value = 'de'
  activeButtonLanguage.value = 'de'
  try {
    window.localStorage.setItem('language', 'de')
  } catch (error) {
    console.error('Error accessing localStorage:', error)
  }
}

onMounted(() => {
  let savedLocale = null
  try {
    savedLocale = window.localStorage.getItem('language')
  } catch (error) {
    console.error('Error accessing localStorage:', error)
  }

  if (savedLocale) {
    locale.value = savedLocale
  } else {
    // If no locale is saved in local storage, default to German
    locale.value = navigator.language
  }
})
</script>

<template>
  <div class="navbar-container">
    <div class="navbar-content">
      <div class="ps-5">
        <VToolbarTitle>
          <span class="font-weight-bold">{{ t('NavbarTitle') }}</span>
        </VToolbarTitle>
      </div>
      <div>
        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VBtn
              elevation="0"
              v-bind="props"
              icon
              @click.stop="drawer = !drawer"
            >
              <VIcon size="28">mdi-theme-light-dark</VIcon>
            </VBtn>
          </template>
          <VList>
            <VListItem>
              <VBtn
                :class="{ selected: activeButtonTheme === 'auto' }"
                class="ps-3"
                elevation="0"
                prepend-icon="mdi-circle-half-full"
                block
                @click="changeToAutomode"
              >
                <template #prepend>
                  <VIcon size="24" />
                </template>
                Auto
              </VBtn>
              <VDivider class="nav-divider" />
              <VBtn
                :class="{ selected: activeButtonTheme === 'light' }"
                elevation="0"
                prepend-icon="mdi-white-balance-sunny"
                block
                @click="changeToLightmode"
              >
                <template #prepend>
                  <VIcon size="24" />
                </template>
                Light
              </VBtn>
              <VDivider class="nav-divider" />
              <VBtn
                :class="{ selected: activeButtonTheme === 'dark' }"
                class="ps-3"
                elevation="0"
                prepend-icon="mdi-moon-waxing-crescent"
                block
                @click="changeToDarkmode"
              >
                <template #prepend>
                  <VIcon size="24" />
                </template>
                Dark
              </VBtn>
            </VListItem>
          </VList>
        </VMenu>

        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VBtn icon v-bind="props" @click.stop="drawer = !drawer">
              <VIcon size="28">mdi-earth</VIcon>
            </VBtn>
          </template>
          <VList>
            <VListItem>
              <VBtn
                :class="{ selected: activeButtonLanguage === 'en' }"
                elevation="0"
                block
                @click="changeToEnglish"
              >
                en
              </VBtn>
              <VDivider class="nav-divider" />
              <VBtn
                :class="{ selected: activeButtonLanguage === 'de' }"
                class="de-button"
                elevation="0"
                block
                @click="changeToGerman"
              >
                de
              </VBtn>
            </VListItem>
          </VList>
        </VMenu>

        <VDialog max-width="800">
          <template #activator="{ props: activatorProps }">
            <VBtn v-bind="activatorProps" icon>
              <VIcon size="28">mdi-help-circle-outline</VIcon>
              <VTooltip activator="parent" location="bottom">
                {{ t('Hilfe') }}
              </VTooltip>
            </VBtn>
          </template>
          <template #default="{ isActive }">
            <VCard>
              <template #title>
                {{ t('InfoDialogTitel') }}
              </template>
              <template #text>
                Lorem ipsum dolor sit amet, semper quis, sapien id natoque elit.
                Nostra urna at, magna at neque sed sed ante imperdiet, dolor
                mauris cursus velit, velit non, sem nec. Volutpat sem ridiculus
                placerat leo, augue in, duis erat proin condimentum in a eget,
                sed fermentum sed vestibulum varius ac, vestibulum volutpat orci
                ut elit eget tortor. Ultrices nascetur nulla gravida ante arcu.
                Pharetra rhoncus morbi ipsum, nunc tempor debitis, ipsum
                pellentesque, vitae id quam ut mauris dui tempor, aptent non.
                Quisque turpis. Phasellus quis lectus luctus orci eget rhoncus.
                Amet donec vestibulum mattis commodo, nulla aliquet, nibh
                praesent, elementum nulla. Sit lacus pharetra tempus magna neque
                pellentesque, nulla vel erat.

                <br />

                Justo ex quisque nulla accusamus venenatis, sed quis. Nibh
                phasellus gravida metus in, fusce aenean ut erat commodo eros.
                Ut turpis, dui integer, nonummy pede placeat nec in sit leo.
                Faucibus porttitor illo taciti odio, amet viverra scelerisque
                quis quis et tortor, curabitur morbi a. Enim tempor at, rutrum
                elit condimentum, amet rutrum vitae tempor torquent nunc.
                Praesent vestibulum integer maxime felis. Neque aenean quia
                vitae nostra, tempus elit enim id dui, at egestas pulvinar.
                Integer libero vestibulum, quis blandit scelerisque mattis
                fermentum nulla, tortor donec vestibulum dolor amet eget, elit
                nullam. Aliquam leo phasellus aliquam curabitur metus a, nulla
                justo mattis duis interdum vel, mollis vitae et id, vestibulum
                erat ridiculus sit pulvinar justo sed. Vehicula convallis, et
                nulla wisi, amet vestibulum risus, quam ac egestas.
              </template>
              <VCardActions>
                <VSpacer />
                <VBtn variant="text" @click="isActive.value = false">
                  {{ t('InfoDialogSchliessen') }}
                </VBtn>
              </VCardActions>
            </VCard>
          </template>
        </VDialog>
        <template v-if="userStore.user">
          <VBtn text="user" icon>
            <VIcon size="28">mdi-account-circle</VIcon>
            <VTooltip activator="parent" location="bottom">
              {{ userStore.user?.name }}
            </VTooltip>
          </VBtn>
          <VBtn text="logout" icon @click="handleLogout">
            <VIcon size="28">mdi-logout-variant</VIcon>
            <VTooltip activator="parent" location="bottom"> Logout </VTooltip>
          </VBtn>
        </template>
        <VBtn v-else text="login" icon>
          <VIcon size="28">mdi-login-variant</VIcon>
          <VTooltip activator="parent" location="bottom"> Login </VTooltip>
          <VMenu :close-on-content-click="false" activator="parent">
            <template #default="{ isActive }">
              <LoginDialog v-if="isActive" />
            </template>
          </VMenu>
        </VBtn>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.selected {
  color: rgb(var(--v-theme-primary));
}

.navbar-container {
  width: 100%;
}

.navbar-content {
  display: flex;
  justify-content: space-between; /* Titel ganz links und Button ganz rechts */
  align-items: center;
}
</style>

<i18n lang="yaml">
en:
  Hilfe: Help
  NavbarTitle: FWP Application
  Sprachwechsel: Select language
  InfoDialogTitel: Explanation
  InfoDialogSchliessen: Close
  ModusWechsel: Select Mode

de:
  Hilfe: Hilfe
  NavbarTitle: FWP Anmeldung
  Sprachwechsel: Sprache wählen
  InfoDialogTitel: Erklärung
  InfoDialogSchliessen: Schliessen
  ModusWechsel: Modus wählen
</i18n>
