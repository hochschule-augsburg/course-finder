<script lang="ts" setup>
import type { AppConf } from '@workspace/api/src/prisma/PrismaTypes'

import { useAppConfStore } from '@/stores/AppConfStore'
import { debounce } from 'lodash-es'
import { ref } from 'vue'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
        <h1>{{ t('global.settings') }}</h1>
      </VCol>
    </VRow>
    <VForm v-if="formData">
      <VRow dense>
        <VCol cols="12" md="4" sm="6">
          <VTextField
            v-model.number="formData.maxCredits"
            :label="t('max-credits')"
            @update:model-value="update"
          />
          <small class="text-caption">{{ t('max-credits-help') }}</small>
        </VCol>
      </VRow>
    </VForm>
  </VContainer>
</template>

<i18n lang="yaml">
en:
  max-credits: 'Max Credits'
  max-credits-help: 'Only applies to new inputs.'
de:
  max-credits: 'Maximale Credits'
  max-credits-help: 'Gilt nur für neue Eingaben.'
</i18n>
