<script lang="ts" setup>
import { useUserStore } from './stores/UserStore'

useUserStore()
</script>

<template>
  <VApp>
    <VMain>
      <RouterView />
    </VMain>
  </VApp>
</template>
