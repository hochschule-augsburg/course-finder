<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VBtn, VCol, VContainer, VFileInput, VRow } from 'vuetify/components'

const { t } = useI18n()
const router = useRouter()
const pending = ref(false)

function uploadFile() {
  pending.value = true

  setTimeout(() => router.back(), 1000)
}
</script>

<template>
  <div class="mx-15">
    <VContainer>
      <VCol justify="space-between">
        <VFileInput
          accept=".pdf"
          label="Select file"
          placeholder="Select file"
          outlined
        />
        <VRow class="pr-3" justify="end">
          <VBtn :loading="pending" :text="t('upload')" @click="uploadFile" />
        </VRow>
      </VCol>
    </VContainer>
  </div>
</template>

<i18n lang="yaml">
en:
  upload: Upload
de:
  upload: Upload
</i18n>
