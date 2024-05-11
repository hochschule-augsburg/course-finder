<script setup lang="ts">
import { useCoursesStore } from '@/stores/CoursesStore'
import { VExpansionPanel, VExpansionPanels } from 'vuetify/components'
const coursesStore = useCoursesStore()
</script>

<template>
  <VExpansionPanels class="px-1 py-4" variant="popout">
    <VExpansionPanel
      v-for="subject in coursesStore.filteredSubjects"
      :key="subject.moduleCode"
    >
      <SubjectTableRow :subject />
    </VExpansionPanel>
  </VExpansionPanels>
</template>
