import type { EnrollPhase } from '@workspace/api/src/prisma/PrismaTypes'
import type { CourseExtended } from '@workspace/api/src/routes/course/CourseRoutes'

import { trpc } from '@/trpc'
import { debounce } from 'lodash-es'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { useEnrollmentStore } from './EnrollmentStore'
import { useFiltersStore } from './FiltersStore'
import { useUserStore } from './UserStore'

export type Subject = {
  offeredCourse?: CourseExtended['offeredCourse']
} & Omit<CourseExtended, 'offeredCourse'>

export const useCoursesStore = defineStore('courses', () => {
  const userStore = useUserStore()
  const filtersStore = useFiltersStore()
  const currentPhase = ref<EnrollPhase>()
  const subjects = ref<Subject[]>([])
  const filteredSubjects = ref<Subject[]>([])
  const enrollmentStore = useEnrollmentStore()

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
    $reset,
    currentPhase,
    filteredSubjects,
    init: update,
    sortSubjects,
    subjects,
  }

  async function update() {
    try {
      if (userStore.user?.type === 'Student') {
        const phase = await trpc.course.getCurrentPhase.query()
        currentPhase.value = phase
      } else {
        currentPhase.value = undefined
      }
    } catch (e) {
      currentPhase.value = undefined
    }
    if (currentPhase.value) {
      await updatePhase(currentPhase.value.id)
    } else {
      subjects.value = await trpc.course.getCourses.query()
    }
  }

  async function updatePhase(phaseId: number) {
    subjects.value = await trpc.course.getOfferedCourses.query({
      phaseId: phaseId,
    })
  }

  function filterSubjects() {
    filteredSubjects.value = [...subjects.value]
    filteredSubjects.value = filtersStore.applyFilters(filteredSubjects.value)
    filteredSubjects.value = filtersStore.searchSubjects(filteredSubjects.value)
    sortSubjects()
  }

  function sortSubjects() {
    filteredSubjects.value.sort((a, b) => {
      const enrolledSubjectA = enrollmentStore.enrolledSubjects.find(
        (s) => s.moduleCode === a.moduleCode,
      )
      const enrolledSubjectB = enrollmentStore.enrolledSubjects.find(
        (s) => s.moduleCode === b.moduleCode,
      )

      if (enrolledSubjectA && enrolledSubjectB) {
        return enrolledSubjectB.points - enrolledSubjectA.points
      } else if (enrolledSubjectA) {
        return -1
      } else if (enrolledSubjectB) {
        return 1
      }
      return a.moduleCode.localeCompare(b.moduleCode)
    })
  }

  function $reset() {
    subjects.value = []
    filteredSubjects.value = []
    currentPhase.value = undefined
  }
})
