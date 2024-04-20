<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { useI18n } from 'vue-i18n'
import { VCardText } from 'vuetify/components'

const enrollmentStore = useEnrollmentStore()
const { locale } = useI18n()
</script>

<template>
  <VCard title="This is the Enrollment Overview - 404">
    <VCardText>
      <p>Sollten wir woanders platzieren</p>
      <p
        v-for="subject in enrollmentStore.selectedSubjects"
        :key="subject.moduleCode"
      >
        {{ locale === 'de' ? subject.title.de : subject.title.en }}
      </p>
    </VCardText>
  </VCard>
</template>
