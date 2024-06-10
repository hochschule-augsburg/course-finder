import type {
  EnrollPhase,
  I18nJson,
} from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { useCoursesStore } from './CoursesStore'

export const useAssignStore = defineStore('assign', () => {
  const coursesStore = useCoursesStore()
  const assignPhases = ref<
    Array<{
      Phase: EnrollPhase
      assignments: Array<{
        Course?: {
          title: I18nJson
        }
        moduleCode: string
        points: number
      }>
      lost: Array<{
        Course?: {
          title: I18nJson
        }
        moduleCode: string
        points: number
      }>
      phaseId: number
    }>
  >([])

  return { assignPhases, fetch }

  async function fetch() {
    const phaseAssignments = await trpc.assign.list.query()
    assignPhases.value = phaseAssignments.map((phase) => ({
      ...phase,
      assignments: phase.assignments.map(extendCourse),
      lost: phase.lost.map(extendCourse),
    }))
  }

  function extendCourse(course: { moduleCode: string; points: number }) {
    const Course = coursesStore.subjects.find(
      (e) => e.moduleCode === course.moduleCode,
    )

    return {
      ...course,
      Course,
    }
  }
})
