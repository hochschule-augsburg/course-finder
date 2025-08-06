<script setup lang="ts">
import { VExpansionPanel, VExpansionPanels } from 'vuetify/components'

import { useSubjectChunks } from '@/composables/subjectChunks'

const { subjects } = useSubjectChunks()
</script>

<template>
  <VExpansionPanels class="px-1 py-4" variant="popout">
    <VExpansionPanel v-for="subject in subjects" :key="subject.moduleCode">
      <SubjectTableRow :subject />
    </VExpansionPanel>
  </VExpansionPanels>
</template>
