<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { computed, ref } from 'vue'
import { VBtn, VBtnToggle, VIcon, VTooltip } from 'vuetify/components'

defineOptions({
  name: 'CourseEnrollmentOverview',
})

const enrollmentStore = useEnrollmentStore()

const pendingEnroll = computed(() =>
  enrollmentStore.enrolledSubjects.some((e) => !e.points),
)
const subjectView = ref<'grid' | 'list'>('grid')
const enrollFormVisible = ref(false)
</script>

<template>
  <div class="container">
    <EnrollmentOverview />
    <EnrollmentForm v-model:visible="enrollFormVisible" />
    <div>
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
      <div v-if="enrollmentStore.enrolledSubjects.length > 0" class="floating">
        <VBtn icon @click="enrollFormVisible = true">
          <VIcon>mdi-pen-lock</VIcon>
          <VTooltip activator="parent" location="top"> Einschreiben </VTooltip>
        </VBtn>
        <div v-if="pendingEnroll" class="pending-indicator" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/mixins';
.pending-indicator {
  @include indicator;
}
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
