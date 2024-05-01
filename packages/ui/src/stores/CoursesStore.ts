import type { EnrollPhase } from '@api/prisma/PrismaTypes'
import type { CourseExtended } from '@api/routes/course/CourseRoutes'

import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { useUserStore } from './UserStore'
import { useFiltersStore } from './filters'

export type Subject = {
  offeredCourse?: CourseExtended['offeredCourse']
} & Omit<CourseExtended, 'offeredCourse'>

export const useCoursesStore = defineStore('courses', () => {
  const userStore = useUserStore()
  const filtersStore = useFiltersStore()
  const currentPhase = ref<EnrollPhase>()
  const maxPoints = ref(1000)
  const subjects = ref<Subject[]>([])

  const filteredSubjects = computed(() => {
    let filtered: Subject[] = [...subjects.value]
    filtered = filtersStore.applyFilters(filtered)
    filtered = filtersStore.searchSubjects(filtered)
    return filtered
  })

  watch(
    () => userStore.user,
    () => {
      void update()
    },
  )

  void update()
  return {
    currentPhase,
    filteredSubjects,
    init: update,
    maxPoints,
    subjects,
  }

  async function update() {
    if (userStore.user?.type !== 'Student') {
      currentPhase.value = undefined
    } else {
      currentPhase.value = await trpc.course.getCurrentPhase.query()
    }
    if (currentPhase.value) {
      await updatePhase(currentPhase.value.id)
    } else {
      subjects.value = await trpc.course.getCourses.query()
    }
    mergeLocals()
  }

  async function updatePhase(phaseId: number) {
    subjects.value = await trpc.course.getOfferedCourses.query({
      phaseId: phaseId,
    })
  }

  function mergeLocals() {
    subjects.value.forEach((s) => {
      if (!s.title.de) {
        s.title.de = s.title.en
      }
      if (!s.title.en) {
        s.title.en = s.title.de
      }
    })
  }
})
