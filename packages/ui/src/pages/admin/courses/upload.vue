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
import { trpc } from '@/trpc'

const { t } = useI18n()
const pendingMB = ref(false)
const status = refThrottled(ref<'error' | 'success'>())
const statusMsg = ref('')
const baFile = ref<File>()
const maFile = ref<File>()

const pendingMin = ref(false)
const minFocusPdf = ref<File>()

async function deleteMinFocus() {
  try {
    await trpc.admin.courses.deleteMinFocus.mutate()
    statusMsg.value = 'MIN Schwerpunkte erfolgreich gelöscht'
    status.value = 'success'
  } catch (e) {
    console.error(e)
    statusMsg.value = t('global.unknown-error')
    status.value = 'error'
  }
}

async function uploadMinFocusPdf() {
  pendingMin.value = true
  try {
    const formData = new FormData()
    if (!minFocusPdf.value) {
      throw new Error('No file selected')
    }
    formData.append('file', minFocusPdf.value)

    await fetchFastify('/admin/courses/update-min-focus', formData)
    statusMsg.value = `Dateien ${[baFile.value, maFile.value]
      .filter((f) => f)
      .map((e) => e?.name)
      .join(', ')} erfolgreich hochgeladen`
    minFocusPdf.value = undefined
    status.value = 'success'
  } catch (e) {
    console.error(e)
    statusMsg.value = t('global.unknown-error')
    status.value = 'error'
  } finally {
    pendingMin.value = false
  }
}

async function uploadModuleBooks() {
  pendingMB.value = true
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
    pendingMB.value = false
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
            :loading="pendingMB"
            text="Upload"
            @click="uploadModuleBooks"
          />
        </VRow>
      </VCol>
    </VContainer>
    <VContainer>
      <VCol justify="space-between">
        <VFileInput
          v-model="minFocusPdf"
          accept=".pdf"
          label="Master Modulhandbuch auswählen"
          placeholder="Datei auswählen"
          outlined
        />
        <VRow class="pr-3" justify="end">
          <VBtn
            color="error"
            text="MIN Schwerpunkte löschen"
            @click="deleteMinFocus"
          />
          <VBtn
            class="ml-2"
            :disabled="!minFocusPdf"
            :loading="pendingMin"
            text="MIN Schwerpunkte aktualisieren"
            @click="uploadMinFocusPdf"
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
