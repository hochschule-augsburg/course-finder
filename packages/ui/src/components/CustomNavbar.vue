<!-- eslint-disable prettier/prettier -->
<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore'
import { useDark, useToggle } from '@vueuse/core'
<<<<<<< HEAD
import { computed, unref } from 'vue'
import { VAppBar } from 'vuetify/components'
=======
import { computed, ref, unref } from 'vue'
import { VBtn, VMenu, VToolbarTitle } from 'vuetify/components'
>>>>>>> e6c6fa2 (Revert "Navbar divided into 3 components")

const isDark = useDark({
  attribute: 'theme',
  selector: 'body',
  valueDark: 'dark',
  valueLight: 'light',
})

const toggleDark = useToggle(isDark)

const userStore = useUserStore()

function handleLogout() {
  void userStore.logout()
}

import { useDisplay } from 'vuetify'

const drawer = ref(false)

const display = useDisplay()

const isMobile = computed(() => {
  return unref(display.mobile)
})
</script>

<template>
  <body>
    <VAppBar>
      <VToolbarTitle>
        <span>{{ $t('NavbarTitle') }}</span>
      </VToolbarTitle>

      <VSpacer />

      <template v-if="isMobile">
        <VAppBarNavIcon @click.stop="drawer = !drawer" />
      </template>

      <template v-else>
        <VBtn text="help" icon>
          <VIcon size="28">mdi-help-circle-outline</VIcon>
          <VTooltip activator="parent" location="bottom">
            {{ $t('Hilfe') }}
          </VTooltip>
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

        <p class="sprachtext-desktop">{{ $t('Sprachwechsel') }}:</p>

        <VBtn
          class="en-button"
          elevation="1"
          rounded="xl"
          @click="$i18n.locale = `en`"
        >
          en
        </VBtn>
        <VBtn
          class="de-button"
          elevation="1"
          rounded="xl"
          @click="$i18n.locale = `de`"
        >
          de
        </VBtn>
      </template>
    </VAppBar>
    <VNavigationDrawer v-model="drawer" location="right" temporary>
      <div class="nav-drawer">
        <VBtn class="help-button" elevation="0" text="help" block>
          {{ $t('Hilfe') }}
          <VIcon size="24">mdi-help-circle-outline</VIcon>
          <VTooltip activator="parent" location="bottom">
            {{ $t('Hilfe') }}
          </VTooltip>
        </VBtn>

        <VDivider class="nav-divider" />
        <p>is Dark: {{ isDark }}</p>
        <button @click="toggleDark()">Toggle Dark Mode</button>
        <VDivider class="nav-divider" />
        <template v-if="userStore.user">
          <VBtn text="user">
            {{ userStore.user?.name }}
            <VIcon size="28">mdi-account-circle</VIcon>
          </VBtn>

          <VBtn elevation="0" text="logout" block @click="handleLogout">
            Logout
            <VIcon size="28">mdi-logout-variant</VIcon>
            <VTooltip activator="parent" location="bottom"> Logout </VTooltip>
          </VBtn>
        </template>
        <VBtn v-else elevation="0" text="login" block>
          Login
          <VIcon size="28">mdi-login-variant</VIcon>
          <VTooltip activator="parent" location="bottom"> Login </VTooltip>

          <VMenu :close-on-content-click="false" activator="parent">
            <template #default="{ isActive }">
              <LoginDialog v-if="isActive" />
            </template>
          </VMenu>
        </VBtn>
        <VDivider class="nav-divider" />

        <div class="language-buttons">
          <p class="Sprachtext">{{ $t('Sprachwechsel') }}:</p>

          <VBtn
            class="en-button"
            elevation="1"
            rounded="xl"
            @click="$i18n.locale = `en`"
          >
            en
          </VBtn>

          <VBtn
            class="de-button"
            elevation="1"
            rounded="xl"
            @click="$i18n.locale = `de`"
          >
            de
          </VBtn>
        </div>
      </div>
    </VNavigationDrawer>
  </body>
</template>

<style scoped lang="scss">
.toolbar-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}
</style>
