import type { EnrollPhase } from '@workspace/api/src/prisma/PrismaTypes'
import type { CourseExtended } from '@workspace/api/src/routes/course/CourseRoutes'

import { trpc } from '@/api/trpc'
import { debounce } from 'lodash-es'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { useUserStore } from './UserStore'
import { useFiltersStore } from './FiltersStore'

export type Subject = {
  offeredCourse?: CourseExtended['offeredCourse']
} & Omit<CourseExtended, 'offeredCourse'>

export const useCoursesStore = defineStore('courses', () => {
  const userStore = useUserStore()
  const filtersStore = useFiltersStore()
  const currentPhase = ref<EnrollPhase>()
  const maxPoints = ref(1000)
  const subjects = ref<Subject[]>([])
  const filteredSubjects = ref<Subject[]>([])

  watch(
    () => userStore.user,
    () => {
      void update()
    },
  )

  watch(
    [
      filtersStore.rangeFilters,
      filtersStore.optionsFilters,
      () => filtersStore.search,
      subjects,
    ],
    debounce(filterSubjects, 300),
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
    try {
      const phase = await trpc.course.getCurrentPhase.query()
      currentPhase.value = phase
    } catch (e) {
      currentPhase.value = undefined
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

  function filterSubjects() {
    filteredSubjects.value = [...subjects.value]
    filteredSubjects.value = filtersStore.applyFilters(filteredSubjects.value)
    filteredSubjects.value = filtersStore.searchSubjects(filteredSubjects.value)
  }
})
