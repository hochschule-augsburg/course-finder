import type { Subject } from '@/stores/CoursesStore'

import { useCoursesStore } from '@/stores/CoursesStore'
import { chunk } from 'lodash-es'
import { onMounted, ref, watch } from 'vue'

export function useSubjectChunks() {
  const coursesStore = useCoursesStore()
  const subjects = ref<Subject[]>([])
  const timeoutIds: NodeJS.Timeout[] = []

  function updateSubjects() {
    timeoutIds.forEach((id) => clearTimeout(id))
    timeoutIds.length = 0
    const chunkSize = 10
    const chunks = chunk(coursesStore.filteredSubjects, chunkSize)
    for (let i = 0; i < chunks.length; i++) {
      timeoutIds.push(
        setTimeout(() => {
          subjects.value.push(...chunks[i])
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
