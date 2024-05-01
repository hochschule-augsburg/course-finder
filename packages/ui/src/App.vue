<script lang="ts" setup>
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
    </VMain>
    <CustomFooter />
  </VApp>
</template>
