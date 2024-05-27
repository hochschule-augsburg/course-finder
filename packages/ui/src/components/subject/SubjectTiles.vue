<script setup lang="ts">
import { useSubjectChunks } from '@/composables/subjectChunks'
import { useCoursesStore } from '@/stores/CoursesStore'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VCol, VContainer, VRow } from 'vuetify/components'

const route = useRoute()
const router = useRouter()

const coursesStore = useCoursesStore()
const { subjects } = useSubjectChunks()
const selectedModuleCode = ref<string | undefined>(
  route.fullPath?.split('#')[1],
)
const selectedSubject = computed(() =>
  coursesStore.subjects.find((s) => s.moduleCode === selectedModuleCode.value),
)

watch(selectedModuleCode, () => {
  if (selectedModuleCode.value) {
    void router.push(`#${selectedModuleCode.value}`)
  } else {
    void router.push('')
  }
})
</script>

<template>
  <div>
    <SubjectDialog
      :subject="selectedSubject"
      :visible="!!selectedSubject"
      @update:visible="selectedModuleCode = undefined"
    />
    <VContainer>
      <VRow justify="center">
        <VCol v-for="subject in subjects" :key="subject.moduleCode" cols="auto">
          <SubjectTile
            :subject
            @click="selectedModuleCode = subject.moduleCode"
          />
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
