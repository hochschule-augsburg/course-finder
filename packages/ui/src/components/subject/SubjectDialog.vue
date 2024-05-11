<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VDialog,
  VSpacer,
} from 'vuetify/components'

defineProps<{
  subject?: Subject
}>()
const showSubjectDialog = defineModel<boolean>('visible')
const { locale } = useI18n()
</script>

<template>
  <VDialog v-model:model-value="showSubjectDialog" max-width="750">
    <VCard v-if="subject" class="pa-2" color="rgb(var(--v-theme-secondary))">
      <VCardTitle>
        <strong>
          {{ locale === 'de' ? subject.title.de : subject.title.en }}
        </strong>
        -
        {{ subject.lecturers.join(', ') }}
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
