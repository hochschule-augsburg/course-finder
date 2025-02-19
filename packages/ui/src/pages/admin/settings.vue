<script lang="ts" setup>
import type { AppConf } from '@workspace/api/src/prisma/PrismaTypes'

import { useAppConfStore } from '@/stores/AppConfStore'
import { debounce } from 'lodash-es'
import { ref } from 'vue'
import { watch } from 'vue'

const appConfigStore = useAppConfStore()

const formData = ref<AppConf>()

watch(
  () => appConfigStore.conf,
  (newVal) => {
    if (newVal) {
      formData.value = newVal
    }
  },
  { immediate: true },
)

const update = debounce(async () => {
  if (!formData.value) return
  await appConfigStore.update(formData.value)
})
</script>

<template>
  <VContainer>
    <VRow>
      <VCol>
        <h1>Einstellungen</h1>
      </VCol>
    </VRow>
    <VForm v-if="formData">
      <VRow dense>
        <VCol cols="12" md="4" sm="6">
          <VTextField
            v-model.number="formData.maxCredits"
            label="Maximale Credits"
            @update:model-value="update"
          />
          <small class="text-caption">Gilt nur für neue Eingaben.</small>
        </VCol>
      </VRow>
    </VForm>
  </VContainer>
</template>
