<script setup >
import { useUserStore } from '@/stores/UserStore'
import { useDark, useToggle } from '@vueuse/core'
import { computed, ref, unref } from 'vue'
import { useDisplay } from 'vuetify'
import { VBtn, VMenu, VToolbarTitle } from 'vuetify/components'

const isDark = useDark()

const toggleDark = useToggle(isDark)

const userStore = useUserStore()



const drawer = ref(false)

const display = useDisplay()

const isMobile = computed(() => {
  return unref(display.mobile)
})

function handleLogout() {
  void userStore.logout()
}

</script>

<template>
  <body>
    <VAppBar>
      <VToolbarTitle>
        <span>{{ $t('NavbarTitle') }}</span>
      </VToolbarTitle>

      <VSpacer />

      <template v-if="isMobile">
        <VMenu transition="slide-y-transition">
          <template #activator="{ props }">
            <VBtn
              icon="mdi-dots-vertical"
              v-bind="props"
              @click.stop="drawer = !drawer"
            />
          </template>
          <VList class="drop-down-list-items">
            <VListItem>
              <template v-if="userStore.user">
                <VBtn text="user">
                  {{ userStore.user?.name }}
                  <VIcon size="28">mdi-account-circle</VIcon>
                </VBtn>

                <VBtn elevation="0" text="logout" block @click="handleLogout">
                  Logout
                  <VIcon size="28">mdi-logout-variant</VIcon>
                </VBtn>
              </template>
              <VBtn v-else elevation="0" text="login" block>
                Login
                <VIcon size="28">mdi-login-variant</VIcon>

                <VMenu :close-on-content-click="false" activator="parent">
                  <template #default="{ isActive }">
                    <LoginDialog v-if="isActive" />
                  </template>
                </VMenu>
              </VBtn>
              <VDivider class="nav-divider" />

              <VDialog max-width="800">
                <template #activator="{ props: activatorProps }">
                  <VBtn
                    v-bind="activatorProps"
                    elevation="0"
                    block
                  >
                    {{ $t('Hilfe') }}
                    <VIcon size="24">mdi-help-circle-outline</VIcon>
                  </VBtn>
                </template>

                <template #default="{ isActive }">
                  <VCard>
                    <template #title>
                      {{ $t('InfoDialogTitel') }}
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
                        {{ $t('InfoDialogSchliessen') }}
                      </VBtn>
                    </VCardActions>
                  </VCard>
                </template>
              </VDialog>
              <VDivider class="nav-divider" />
              <p>is Dark: {{ isDark }}</p>
              <button class="darkmode-button" @click="toggleDark()">
                Toggle Dark Mode
              </button>
              <VDivider class="nav-divider" />
              <div class="language-buttons-mobile">
                <p class="sprachtext-mobile">{{ $t('Sprachwechsel') }}:</p>

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
            </VListItem>
          </VList>
        </VMenu>
      </template>

      <template v-else>
        <VDialog max-width="800">
          <template #activator="{ props: activatorProps }">
            <VBtn v-bind="activatorProps" icon>
              <VIcon size="28">mdi-help-circle-outline</VIcon>
              <VTooltip activator="parent" location="bottom">
                {{ $t('Hilfe') }}
              </VTooltip>
            </VBtn>
          </template>

          <template #default="{ isActive }">
            <VCard>
              <template #title>
                {{ $t('InfoDialogTitel') }}
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
                  {{ $t('InfoDialogSchliessen') }}
                </VBtn>
              </VCardActions>
            </VCard>
          </template>
        </VDialog>

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
  </body>
</template>

<style scoped lang="scss">




.nav-divider {
  color: black;
  padding-top: 1px;
}

.language-buttons-mobile {
  margin-left: 14px;
  margin-bottom: 5px;
  margin-top: 7px;
}

.en-button {
  margin-right: 10px;
}

.darkmode-button {
  margin-top: 7px;
}

.sprachtext-mobile {
  margin-left: 10px;
  margin-bottom: 4px;
}

.sprachtext-desktop {
  margin-right: 5px;
}

.drop-down-list-items {
  width: 200px;
}
</style>



    