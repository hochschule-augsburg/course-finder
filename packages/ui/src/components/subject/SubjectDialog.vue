<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDialog,
  VSpacer,
} from 'vuetify/components'

import { alertService } from '../AlertService'

defineProps<{
  subject?: Subject
}>()
const showSubjectDialog = defineModel<boolean>('visible')
const { locale } = useI18n()
const route = useRoute()

async function copyLinkToClipboard() {
  await navigator.clipboard.writeText(`${window.origin}${route.fullPath}`)
  alertService.show({ color: 'neutral', text: 'Link copied to clipboard' })
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
            icon="mdi-link"
            variant="text"
            @click="copyLinkToClipboard"
          />
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
  link_copied: Link copied to clipboard
de:
  link_copied: Link kopiert
</i18n>
