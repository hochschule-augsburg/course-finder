<script setup lang="ts">
import { ref } from 'vue'

const view = ref('grid')
</script>

<template>
  <div>
    <EnrollmentOverview />
    <FilterSection />
    <VBtnToggle v-model="view" class="px-3 d-flex justify-end" mandatory>
      <VBtn icon="mdi-format-list-bulleted" value="list" />
      <VBtn icon="mdi-dots-grid" value="grid" />
    </VBtnToggle>
    <SubjectTiles v-if="view === 'grid'" />
    <SubjectTable v-if="view === 'list'" />
  </div>
</template>
