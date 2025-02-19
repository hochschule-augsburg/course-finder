<script lang="ts" setup>
import { fetchFastify } from '@/fastify'
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

const { t } = useI18n()
const pending = ref(false)
const status = refThrottled(ref<'error' | 'success'>())
const statusMsg = ref('')
const file = ref<File>()
const oldFile = ref<File>()

async function uploadFile() {
  pending.value = true
  if (!file.value) {
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', file.value)

    await fetchFastify('/admin/courses/upload-module-book', formData)
    oldFile.value = file.value
    file.value = undefined
    statusMsg.value = `Datei ${oldFile.value.name} erfolgreich hochgeladen`
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
          v-model="file"
          accept=".pdf"
          label="Datei auswählen"
          placeholder="Datei auswählen"
          outlined
        />
        <VRow class="pr-3" justify="end">
          <VBtn
            :disabled="!file"
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
