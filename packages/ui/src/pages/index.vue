<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { ref } from 'vue'

const enrollmentStore = useEnrollmentStore()
const subjectView = ref<'grid' | 'list'>('grid')
const enrollView = ref(false)
</script>

<template>
  <div class="container">
    <EnrollmentOverview :enroll-view="enrollView" />
    <EnrollmentForm v-model="enrollView" />
    <div v-if="!enrollView">
      <FilterSection />
      <VBtnToggle
        v-model="subjectView"
        class="px-3 d-flex justify-end"
        mandatory
      >
        <VBtn icon="mdi-format-list-bulleted" text="list" value="list" />
        <VBtn icon="mdi-dots-grid" text="grid" value="grid" />
      </VBtnToggle>
      <SubjectTiles v-if="subjectView === 'grid'" />
      <SubjectTable v-if="subjectView === 'list'" />
      <VBtn
        v-if="enrollmentStore.selectedSubjects.length > 0"
        class="px-3 floating"
        icon="mdi-arrow-right"
        @click="enrollView = true"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  height: 100%;
}
.floating {
  position: fixed;
  z-index: 1;
  bottom: var(--floating-margin);
  right: var(--floating-margin);
}
</style>
