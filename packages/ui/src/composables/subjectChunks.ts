import type { Subject } from '@/stores/CoursesStore'

import { useCoursesStore } from '@/stores/CoursesStore'
import { onMounted, ref, watch } from 'vue'

export function useSubjectChunks() {
  const coursesStore = useCoursesStore()
  const subjects = ref<Subject[]>([])
  const timeoutIds: NodeJS.Timeout[] = []

  function getSubjectsChunk(chunkIndex: number, chunkSize: number) {
    const start = chunkIndex * chunkSize
    const end = start + chunkSize
    return coursesStore.filteredSubjects.slice(start, end)
  }

  function updateSubjects() {
    timeoutIds.forEach((id) => clearTimeout(id))
    timeoutIds.length = 0
    const chunkSize = 10
    const chunks =
      Math.floor(coursesStore.filteredSubjects.length / chunkSize) + 1

    for (let i = 0; i < chunks; i++) {
      timeoutIds.push(
        setTimeout(() => {
          subjects.value.push(...getSubjectsChunk(i, chunkSize))
        }, 1),
      )
    }
  }

  watch(
    () => coursesStore.filteredSubjects,
    () => {
      subjects.value = []
      updateSubjects()
    },
  )

  onMounted(() => {
    updateSubjects()
  })

  return { subjects }
}
