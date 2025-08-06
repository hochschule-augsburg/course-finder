<script lang="ts" setup>
import { refThrottled } from '@vueuse/core'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCol,
  VContainer,
  VFileInput,
  VRow,
  VSnackbar,
} from 'vuetify/components'

import { fetchFastify } from '@/fastify'

const { t } = useI18n()
const pending = ref(false)
const status = refThrottled(ref<'error' | 'success'>())
const statusMsg = ref('')
const baFile = ref<File>()
const maFile = ref<File>()

async function uploadFile() {
  pending.value = true
  try {
    const formData = new FormData()
    if (baFile.value) {
      formData.append('baFile', baFile.value)
    }
    if (maFile.value) {
      formData.append('maFile', maFile.value)
    }

    await fetchFastify('/admin/courses/upload-module-book', formData)
    statusMsg.value = `Dateien ${[baFile.value, maFile.value]
      .filter((f) => f)
      .map((e) => e?.name)
      .join(', ')} erfolgreich hochgeladen`
    baFile.value = undefined
    maFile.value = undefined
    status.value = 'success'
  } catch (e) {
    console.error(e)
    statusMsg.value = t('global.unknown-error')
    status.value = 'error'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="mx-15">
    <VContainer>
      <VCol justify="space-between">
        <VFileInput
          v-model="baFile"
          accept=".pdf"
          label="Bachelor Modulhandbuch (de) auswählen"
          placeholder="Datei auswählen"
          outlined
        />
        <VFileInput
          v-model="maFile"
          accept=".pdf"
          label="Master Modulhandbuch auswählen"
          placeholder="Datei auswählen"
          outlined
        />
        <VRow class="pr-3" justify="end">
          <VBtn
            :disabled="!baFile || !maFile"
            :loading="pending"
            text="Upload"
            @click="uploadFile"
          />
        </VRow>
      </VCol>
    </VContainer>
    <VSnackbar
      :color="status"
      :model-value="!!status"
      :text="statusMsg"
      :timeout="2000"
      location="bottom left"
      rounded="pill"
      @update:model-value="status = undefined"
    />
  </div>
</template>
