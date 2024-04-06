<script setup lang="ts">
import { trpc } from '@/api/trpc'
import { ref } from 'vue'

const username = ref('')
const password = ref('')

async function login() {
  console.log(
    await trpc.auth.login.query({
      password: password.value,
      username: username.value,
    }),
  )
}
</script>
<template>
  <h1>This page is only for testing purposes</h1>
  <VTextField v-model:model-value="username" type="text" />
  <VTextField v-model:model-value="password" type="password" />
  <button @click="login">login</button>
</template>
