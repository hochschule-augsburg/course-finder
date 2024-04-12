<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { ref } from 'vue'

const enrollmentStore = ref(useEnrollmentStore())
</script>

<template>
  <div>
    <h1>This page is only for testing purposes</h1>
    <FilterSection />
    <VList
      v-for="subject in enrollmentStore.filteredSubjects"
      :key="subject.name"
      class="mx-3"
    >
      {{
        subject.name + ' ' + subject.prof + ' ' + subject.cp + ' ' + subject.sws
      }}
    </VList>
  </div>
</template>
