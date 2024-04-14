<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'

const enrollmentStore = useEnrollmentStore()
</script>

<template>
  <div style="height: 200px; background-color: lightgrey; margin: 16px">
    <h1>This is the Enrollment Overview - 404</h1>
    <p>Sollten wir woanders platzieren</p>
    <p v-for="subject in enrollmentStore.selectedSubjects" :key="subject.name">
      {{ subject.name }}
    </p>
  </div>
</template>
