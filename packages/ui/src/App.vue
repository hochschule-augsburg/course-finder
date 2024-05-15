<script lang="ts" setup>
import { VApp, VMain } from 'vuetify/components'

import { ServiceAlert } from './components/AlertService'
import { ModalDialog } from './components/DialogService'
import { useUserStore } from './stores/UserStore'

useUserStore()
</script>

<template>
  <VApp>
    <CustomNavbar />
    <VMain class="my-4 mx-2">
      <ModalDialog />
      <RouterView />
      <ServiceAlert />
    </VMain>
    <CustomFooter />
  </VApp>
</template>
