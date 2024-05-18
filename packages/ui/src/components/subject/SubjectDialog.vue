<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  VBtn,
  VCard,
  VCardTitle,
  VDialog,
  VIcon,
  VSnackbar,
  VSpacer,
  VTooltip,
} from 'vuetify/components'

defineProps<{
  subject?: Subject
}>()
const showSubjectDialog = defineModel<boolean>('visible')
const { locale, t } = useI18n()
const route = useRoute()

const showLinkCopied = ref(false)

async function copyLinkToClipboard() {
  await navigator.clipboard.writeText(`${window.origin}${route.fullPath}`)
  showLinkCopied.value = true
}
</script>

<template>
  <VDialog v-model:model-value="showSubjectDialog" max-width="750">
    <VCard v-if="subject" class="pa-2" color="rgb(var(--v-theme-secondary))">
      <VCardTitle>
        <div class="d-flex align-center">
          <span class="text-truncate">
            <strong>
              {{ locale === 'de' ? subject.title.de : subject.title.en }}
            </strong>
            -
            {{ subject.lecturers.join(', ') }}
          </span>
          <VSpacer />
          <VBtn
            class="flex-shrink-0"
            color="primary"
            variant="text"
            icon
            @click="copyLinkToClipboard"
          >
            <VIcon> mdi-link </VIcon>
            <VTooltip activator="parent" location="bottom right">
              {{ t('copy-link') }}
            </VTooltip>
            <VSnackbar
              v-model="showLinkCopied"
              activator="parent"
              color="secondary"
              location="bottom left"
              rounded="pill"
              timeout="500"
            >
              {{ t('link-copied') }}
            </VSnackbar>
          </VBtn>
        </div>
      </VCardTitle>
      <VCardText class="pa-0 pb-3 px-3">
        <SubjectDetails :subject="subject" />
      </VCardText>

      <VCardActions class="mx-4">
        <VSpacer />
        <VBtn
          color="primary"
          text="Close"
          variant="tonal"
          @click="showSubjectDialog = false"
        />
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<i18n lang="yaml">
en:
  copy-link: Copy link
  link-copied: Link copied to clipboard
de:
  copy-link: Link kopieren
  link-copied: Link kopiert
</i18n>
