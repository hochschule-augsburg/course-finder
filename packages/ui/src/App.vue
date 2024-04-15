<script lang="ts" setup>
import { useUserStore } from './stores/UserStore'

useUserStore()
</script>

<template>
  <VApp>
    <CustomNavbar />
    <VMain class="my-4 mx-2">
      <RouterView />
    </VMain>
    <CustomFooter />
  </VApp>
</template>
