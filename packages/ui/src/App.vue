<script lang="ts" setup>
import { useUserStore } from './stores/UserStore'

useUserStore()
</script>

<template>
  <VApp>
    <Navbar/>
      <VMain >
        <RouterView/>
      </VMain>
    <Footer/>
  </VApp>
</template>