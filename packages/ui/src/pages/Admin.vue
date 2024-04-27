<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { VBtn } from 'vuetify/components'

const enrollmentStore = useEnrollmentStore()
const currentPhase = enrollmentStore.currentPhase

function formatDate(dateString: string | undefined) {
  if (!dateString) {
    return ''; 
  }
  const date = new Date(dateString);
  const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:00`;
  return formattedDate;
}

</script>

<template>
  <h1>Administration</h1>
  <div>
    <h2>Current phase: {{ currentPhase?.title.en }}</h2>
    Start: {{ formatDate(currentPhase?.start.toString()) }} <br />
    End: {{ formatDate(currentPhase?.end.toString()) }}
  </div>
  <VBtn text="Create enrollment phase" />
  <!-- Comment <SubjectTable /> -->
</template>
