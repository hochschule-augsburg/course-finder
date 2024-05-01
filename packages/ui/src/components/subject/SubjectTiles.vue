<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { useCoursesStore } from '@/stores/CoursesStore'
import { ref } from 'vue'

const coursesStore = useCoursesStore()
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)

function openSubjectDialog(moduleCode: string) {
  selectedSubject.value = coursesStore.subjects.find(
    (s) => s.moduleCode === moduleCode,
  )
  showSubjectDialog.value = true
}
</script>

<template>
  <div>
    <SubjectDialog v-model="showSubjectDialog" :subject="selectedSubject" />
    <VContainer>
      <VRow justify="center">
        <VCol
          v-for="subject in coursesStore.filteredSubjects"
          :key="subject.moduleCode"
          cols="auto"
        >
          <SubjectTile
            :subject
            @click="openSubjectDialog(subject.moduleCode)"
          />
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
