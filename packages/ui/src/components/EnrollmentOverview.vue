<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { VCardText } from 'vuetify/components'

const enrollmentStore = useEnrollmentStore()
</script>

<template>
  <VCard title="This is the Enrollment Overview - 404">
    <VCardText>
      <p>Sollten wir woanders platzieren</p>
      <p
        v-for="subject in enrollmentStore.selectedSubjects"
        :key="subject.moduleCode"
      >
        {{ subject.title.de }}
      </p>
    </VCardText>
  </VCard>
</template>
