<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'

const { selectedSubject } = defineProps<{
  selectedSubject?: number
}>()
const showSubjectDialog = defineModel<boolean>()
const enrollmentStore = useEnrollmentStore()
</script>

<template>
  <VDialog v-model:model-value="showSubjectDialog" max-width="500">
    <VCard v-if="selectedSubject !== undefined && selectedSubject >= 0">
      <VCardTitle>
        {{ enrollmentStore.subjects[selectedSubject].name }}
      </VCardTitle>
      <VCardText> test </VCardText>
    </VCard>
  </VDialog>
</template>
