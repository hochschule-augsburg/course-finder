<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/valid-v-slot -->
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
  <VCard>
    <VLayout>
      <VNavigationDrawer expand-on-hover rail>
        <VList>
          <VListItem
            prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
            subtitle="sandra_a88@gmailcom"
            title="Sandra Adams"
          />
        </VList>

        <VDivider />

        <VList density="compact" nav>
          <VListItem
            prepend-icon="mdi-folder"
            title="My Files"
            value="myfiles"
          />
          <VListItem
            prepend-icon="mdi-account-multiple"
            title="Shared with me"
            value="shared"
          />
          <VListItem prepend-icon="mdi-star" title="Starred" value="starred" />
        </VList>
      </VNavigationDrawer>

      <VMain style="height: 100vh">
        <VStepper
          :items="['Step 1', 'Step 2', 'Step 3']"
          alt-labels
          hide-actions
        >
          <template #item.1>
            <VTextField v-model:model-value="username" type="text" />
            <VTextField v-model:model-value="password" type="password" />
            <button @click="login">login</button>
          </template>

          <template #item.2>
            <VCard title="Step Two" flat> ... </VCard>
          </template>

          <template #item.3>
            <VCard title="Step Three" flat> ... </VCard>
          </template>
        </VStepper>
      </VMain>
    </VLayout>
  </VCard>
</template>
