<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { computed, ref, unref,onMounted } from 'vue'
import { useDisplay, useTheme } from 'vuetify'
import { VBtn, VMenu, VSpacer, VToolbarTitle } from 'vuetify/components'
import { useI18n } from 'vue-i18n'

const { t,locale } = useI18n()


const userStore = useUserStore()
const activeButtonTheme = ref(null)
const activeButtonLanguage = ref(null)
const drawer = ref(false)
const display = useDisplay()

const isMobile = computed(() => {
  return unref(display.mobile)
})

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
    console.error('Error accessing localStorage:', error.message)
  }
  if (savedTheme) {
    theme.global.name.value = savedTheme
  } else {
    // Use preferred color scheme of user's browser
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.global.name.value = prefersDarkMode ? 'customDarkTheme' : 'customLightTheme'
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
    console.error('Error accessing localStorage:', error.message)
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
    console.error('Error accessing localStorage:', error.message)
  }
}

function changeToAutomode() {
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
  theme.global.name.value = prefersDarkMode ? 'customDarkTheme' : 'customLightTheme'
  const currenttheme = theme.global.name.value
  activeButtonTheme.value = 'auto'
  try {
    // Save selected theme to localStorage
    localStorage.setItem('theme', currenttheme)
  } catch (error) {
    // Handle error accessing localStorage
    console.error('Error accessing localStorage:', error.message)
  }
}

function changeToEnglish() {
  locale.value = 'en'
  activeButtonLanguage.value = 'en'
  try {
    window.localStorage.setItem('language', 'en')
  } catch (error) {
    console.error('Error accessing localStorage:', error.message)
  }
}

function changeToGerman() {
  locale.value = 'de'
  activeButtonLanguage.value = 'de'
  try {
    window.localStorage.setItem('language', 'de')
  } catch (error) {
    console.error('Error accessing localStorage:', error.message)
  }
}

onMounted(() => {
  let savedLocale = null
  try {
    savedLocale = window.localStorage.getItem('language')
  } catch (error) {
    console.error('Error accessing localStorage:', error.message)
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
  <div >
    <VAppBar>
      <VToolbarTitle>
        <span>{{ t('NavbarTitle') }}</span>
      </VToolbarTitle>
      <VSpacer />
      <template v-if="isMobile">
        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VBtn
              icon="mdi-dots-vertical"
              v-bind="props"
              @click.stop="drawer = !drawer"
            >
            <VIcon size="30"></VIcon>
            </VBtn>
          </template>
          <VList >
            <VListItem >
              <VMenu transition="slide-y-transition" >
                  <template #activator="{ props }">
                    <VBtn 
                      elevation="0"
                      v-bind="props"
                      block
                      @click.stop="drawer = !drawer"
                      class=" left-aligned-mobile"
                      prepend-icon="mdi-theme-light-dark"
                    >
                    <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                    </template>
                    {{ t('ModusWechsel') }}
                    </VBtn>
                  </template>
                  <VList>
                    <VListItem>
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToAutomode"
                        prepend-icon="mdi-circle-half-full"
                        class="auto-button-mobile"
                        :class="{ 'selected': activeButtonTheme === 'auto' }"
                      >
                      <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                      </template>
                      Auto
                      </VBtn>
                      <VDivider class="nav-divider" />
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToLightmode"
                        prepend-icon="mdi-white-balance-sunny"
                        :class="{ 'selected': activeButtonTheme === 'light' }"
                      >
                      <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                      </template>
                        Light
                      </VBtn>
                      <VDivider class="nav-divider" />
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToDarkmode"
                        prepend-icon="mdi-moon-waxing-crescent"
                        class="dark-button-mobile"
                        :class="{ 'selected': activeButtonTheme === 'dark' }"
                      >
                      <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                      </template>
                        Dark
                      </VBtn>
                    </VListItem>
                  </VList>
                </VMenu>
              <VDivider class="nav-divider" />
              <div>
                <VMenu transition="slide-y-transition">
                  <template #activator="{ props }">
                    <VBtn
                      elevation="0"
                      v-bind="props"
                      block
                      @click.stop="drawer = !drawer"
                      prepend-icon="mdi-earth"
                    >
                    <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                    </template>
                      {{ t('Sprachwechsel') }}
                    </VBtn>
                  </template>
                  <VList>
                    <VListItem>
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToEnglish"
                        :class="{ 'selected': activeButtonLanguage === 'en' }"
                      >
                        en
                      </VBtn>
                      <VDivider class="nav-divider" />
                      <VBtn
                        class="de-button"
                        elevation="0"
                        block
                        @click="changeToGerman"
                        :class="{ 'selected': activeButtonLanguage === 'de' }"
                      >
                        de
                      </VBtn>
                    </VListItem>
                  </VList>
                </VMenu>
              </div>
              <VDivider class="nav-divider" />
              <VDialog max-width="800">
                <template #activator="{ props: activatorProps }">
                  <VBtn class ="left-aligned-mobile" v-bind="activatorProps" elevation="0" block 
                  prepend-icon="mdi-help-circle-outline" >
                    <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                    </template>
                    {{ t('Hilfe') }}
                  </VBtn>
                </template>
                <template #default="{ isActive }">
                  <VCard>
                    <template #title>
                      {{ t('InfoDialogTitel') }}
                    </template>
                    <template #text>
                      Lorem ipsum dolor sit amet, semper quis, sapien id natoque
                      elit. Nostra urna at, magna at neque sed sed ante
                      imperdiet, dolor mauris cursus velit, velit non, sem nec.
                      Volutpat sem ridiculus placerat leo, augue in, duis erat
                      proin condimentum in a eget, sed fermentum sed vestibulum
                      varius ac, vestibulum volutpat orci ut elit eget tortor.
                      Ultrices nascetur nulla gravida ante arcu. Pharetra
                      rhoncus morbi ipsum, nunc tempor debitis, ipsum
                      pellentesque, vitae id quam ut mauris dui tempor, aptent
                      non. Quisque turpis. Phasellus quis lectus luctus orci
                      eget rhoncus. Amet donec vestibulum mattis commodo, nulla
                      aliquet, nibh praesent, elementum nulla. Sit lacus
                      pharetra tempus magna neque pellentesque, nulla vel erat.

                      <br />

                      Justo ex quisque nulla accusamus venenatis, sed quis. Nibh
                      phasellus gravida metus in, fusce aenean ut erat commodo
                      eros. Ut turpis, dui integer, nonummy pede placeat nec in
                      sit leo. Faucibus porttitor illo taciti odio, amet viverra
                      scelerisque quis quis et tortor, curabitur morbi a. Enim
                      tempor at, rutrum elit condimentum, amet rutrum vitae
                      tempor torquent nunc. Praesent vestibulum integer maxime
                      felis. Neque aenean quia vitae nostra, tempus elit enim id
                      dui, at egestas pulvinar. Integer libero vestibulum, quis
                      blandit scelerisque mattis fermentum nulla, tortor donec
                      vestibulum dolor amet eget, elit nullam. Aliquam leo
                      phasellus aliquam curabitur metus a, nulla justo mattis
                      duis interdum vel, mollis vitae et id, vestibulum erat
                      ridiculus sit pulvinar justo sed. Vehicula convallis, et
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
              <VDivider class="nav-divider" />
              <template v-if="userStore.user">
                <VBtn text="user" prepend-icon="mdi-account-circle" class="left-aligned-mobile" elevation="0" block>
                    <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                    </template>
                    {{ userStore.user?.name }}
                </VBtn>
                <VDivider class="nav-divider" />
                <VBtn elevation="0" text="logout" block @click="handleLogout" prepend-icon="mdi-logout-variant" 
                class="left-aligned-mobile">

                    <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                    </template>
                  Logout
                </VBtn>
              </template>
              <VBtn v-else elevation="0" text="login" block prepend-icon="mdi-login-variant"
               class="left-aligned-mobile" >
                <template v-slot:prepend>
                     <VIcon size="24"></VIcon>
                </template>
                Login
                <VMenu :close-on-content-click="false" activator="parent">
                  <template #default="{ isActive }">
                    <LoginDialog v-if="isActive" />
                  </template>
                </VMenu>
              </VBtn>
            </VListItem>
          </VList>
        </VMenu>
      </template>

      <template v-else>
        <VMenu transition="slide-y-transition" >
                  <template #activator="{ props }">
                    <VBtn 
                      elevation="0"
                      v-bind="props"
                      @click.stop="drawer = !drawer"
                      icon                     
                    >
                      <VIcon size="28">mdi-theme-light-dark</VIcon>
                    </VBtn>
                  </template>
                  <VList>
                    <VListItem>
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToAutomode"
                        prepend-icon="mdi-circle-half-full"
                        class="auto-button-mobile"
                        :class="{ 'selected': activeButtonTheme === 'auto' }"
                      >
                      <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                      </template>
                      Auto
                      </VBtn>
                      <VDivider class="nav-divider" />
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToLightmode"
                        prepend-icon="mdi-white-balance-sunny"
                        :class="{ 'selected': activeButtonTheme === 'light' }"
                      >
                      <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
                      </template>
                        Light
                      </VBtn>
                      <VDivider class="nav-divider" />
                      <VBtn
                        elevation="0"
                        block
                        @click="changeToDarkmode"
                        prepend-icon="mdi-moon-waxing-crescent"
                        class="dark-button-mobile"
                        :class="{ 'selected': activeButtonTheme === 'dark' }"
                      >
                      <template v-slot:prepend>
                        <VIcon size="24"></VIcon>
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
                elevation="0"
                block
                @click="changeToEnglish"
                :class="{ 'selected': activeButtonLanguage === 'en' }"
              >
                en
              </VBtn>
              <VDivider class="nav-divider" />
              <VBtn
                class="de-button"
                elevation="0"
                block
                @click="changeToGerman"
                :class="{ 'selected': activeButtonLanguage === 'de' }"
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
          <VBtn text="user" icon >
            <VIcon size="28">mdi-account-circle</VIcon>
            <VTooltip activator="parent" location="bottom">{{ userStore.user?.name }}</VTooltip>
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
      </template>
    </VAppBar>
  </div>
</template>

<style scoped lang="scss">
.nav-divider {
  color: black;
  padding-top: 0.063rem;
}

.left-aligned-mobile{
    justify-content: flex-start;
}

.dark-button-mobile{
    padding-right: 1.375rem;
}

.auto-button-mobile {
    padding-right: 1.188rem;
}

.selected{
  color: rgb(var(--v-theme-primary));
}
</style>

<i18n lang="yaml">
  en:
    Hilfe: Help
    NavbarTitle: FWP Application
    Sprachwechsel: Select language
    InfoDialogTitel : Explanation
    InfoDialogSchliessen : Close
    ModusWechsel : Select Mode
    
  de:
    Hilfe: Hilfe
    NavbarTitle: FWP Anmeldung
    Sprachwechsel: Sprache wählen
    InfoDialogTitel : Erklärung
    InfoDialogSchliessen : Schliessen
    ModusWechsel : Modus wählen
</i18n>
