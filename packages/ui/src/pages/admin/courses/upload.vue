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
    statusMsg.value = t('uploaded-successfully', [oldFile.value.name])
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
          :label="t('select-file')"
          :placeholder="t('select-file')"
          accept=".pdf"
          outlined
        />
        <VRow class="pr-3" justify="end">
          <VBtn
            :disabled="!file"
            :loading="pending"
            :text="t('upload')"
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

<i18n lang="yaml">
en:
  upload: Upload
  select-file: Select file
  uploaded-successfully: 'File {0} uploaded successfully'
de:
  upload: Upload
  select-file: Datei auswählen
  uploaded-successfully: 'Datei {0} erfolgreich hochgeladen'
</i18n>
