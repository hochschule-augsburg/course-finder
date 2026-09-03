<script lang="ts" setup>
import type { AppConf } from '@workspace/api/src/prisma/PrismaTypes'

import { debounce } from 'lodash-es'
import { ref } from 'vue'
import { watch } from 'vue'

import { useAppConfStore } from '@/stores/AppConfStore'

const appConfigStore = useAppConfStore()

const formData = ref<AppConf>()

watch(
  () => appConfigStore.conf,
  (newVal) => {
    if (newVal) {
      formData.value = {
        ...newVal,
        mailReceivers: newVal.mailReceivers ?? [],
      }
    }
  },
  { immediate: true },
)

const emailRules = [
  (v: string[] | undefined) =>
    !v ||
    v.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
    'Bitte gültige E-Mail-Adressen eingeben',
]

const update = debounce(async () => {
  if (!formData.value) return
  await appConfigStore.update({
    mailReceivers: formData.value.mailReceivers?.filter(Boolean),
    maxCredits: formData.value.maxCredits,
  })
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
        <VCol cols="12" md="8" sm="12">
          <VCombobox
            v-model="formData.mailReceivers"
            chips
            closable-chips
            clearable
            hint="Empfänger für allgemeine Ankündigungen (z. B. Semesterverteiler)"
            label="E-Mail-Empfänger (Mailinglisten)"
            multiple
            persistent-hint
            :rules="emailRules"
            @update:model-value="update"
          />
        </VCol>
      </VRow>
    </VForm>
  </VContainer>
</template>
