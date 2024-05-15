import type {
  Course as ApiCourse,
  EnrollPhase,
  I18nJson,
  OfferedCourse,
} from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/api/trpc'
import { useAsyncState } from '@vueuse/core'
import { isWithinInterval } from 'date-fns'
import { memoize } from 'lodash-es'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type Course = Omit<ApiCourse, 'pdf'>

export type Phase = EnrollPhase

export type AdminOfferedCourse = { Course: { title: I18nJson } } & OfferedCourse

export const useAdminCoursesStore = defineStore('admin-courses', () => {
  const courses = ref<Course[]>([])
  const phases = ref<Phase[]>([])
  const phaseOfferedCourses = ref<Record<number, AdminOfferedCourse[]>>({})
  const assignments = ref<
    Record<
      number,
      Array<{ count: number; moduleCode: string; title?: I18nJson }>
    >
  >({})

  const currentPhase = computed(() => {
    return phases.value.find((e) =>
      isWithinInterval(new Date(), {
        end: new Date(e.end),
        start: new Date(e.start),
      }),
    )
  })
  const fetchOfferedCourses = memoize(async (phaseId: number) => {
    phaseOfferedCourses.value[phaseId] =
      await trpc.admin.enroll.offeredCourse.list.query({
        phaseId,
      })
  })
  const fetchAssignments = memoize(async (phaseId: number) => {
    assignments.value[phaseId] = (
      await trpc.admin.assign.list.query({
        phaseId,
      })
    ).map(extendAssignment)
  })

  return {
    assignments,
    courses,
    currentPhase,
    fetchAssignments,
    fetchOfferedCourses,
    isInit: useAsyncState(async () => {
      await init()
      return true
    }, false).state,
    phaseOfferedCourses,
    phases,
  }

  async function init() {
    await Promise.all([
      (async () => (courses.value = await trpc.admin.courses.list.query()))(),
      (async () =>
        (phases.value = await trpc.admin.enroll.phase.list.query()))(),
    ])
  }

  function extendAssignment(assignment: { count: number; moduleCode: string }) {
    const course = courses.value.find(
      (e) => e.moduleCode === assignment.moduleCode,
    )
    return { ...assignment, title: course?.title }
  }
})
