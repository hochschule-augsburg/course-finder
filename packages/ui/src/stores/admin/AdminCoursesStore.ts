import type {
  Course as ApiCourse,
  EnrollPhase,
  I18nJson,
  OfferedCourse,
} from '@workspace/api/src/prisma/PrismaTypes'

import { phaseStates } from '@/helper/enums/phaseStates'
import { trpc } from '@/trpc'
import { useAsyncState } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type Course = Omit<ApiCourse, 'maPdf' | 'pdf'>

export type Phase = EnrollPhase

export type AdminOfferedCourse = {
  Course: { lecturers: string[]; title: I18nJson }
} & OfferedCourse

export function usePhaseState(phaseId: number) {
  const coursesStore = useAdminCoursesStore()

  return computed(() => {
    const state = coursesStore.phases[phaseId]?.state
    return {
      modelValue: state,
      text: phaseStates.find((e) => e.value === state)?.text,
    }
  })
}

export const useAdminCoursesStore = defineStore('admin-courses', () => {
  const courses = ref<Course[]>([])
  const phases = ref<Record<number, Phase>>({})
  const phaseOfferedCourses = ref<Record<number, AdminOfferedCourse[]>>({})

  const currentPhase = computed(() => {
    return Object.values(phases.value).find((e) =>
      ['CLOSED', 'DRAWING', 'OPEN'].includes(e.state),
    )
  })
  return {
    courses,
    currentPhase,
    fetchOfferedCourses,
    isInit: useAsyncState(async () => {
      await init()
      return true
    }, false).state,
    phaseOfferedCourses,
    phases,
    updatePhaseState,
  }

  async function init() {
    await Promise.all([
      (async () =>
        Object.assign(courses.value, await trpc.admin.courses.list.query()))(),
      (async () =>
        Object.assign(
          phases.value,
          await trpc.admin.enroll.phase.list.query(),
        ))(),
    ])
  }

  async function updatePhaseState(phaseId: number, state?: Phase['state']) {
    const phase = phases.value[phaseId]
    if (!phase || !state) {
      throw new Error('Phase not found')
    }
    const result = await trpc.admin.enroll.phase.updateState.mutate({
      id: phaseId,
      state: state,
    })
    if (typeof result === 'object') {
      phase.state = state
    }
    return result
  }

  async function fetchOfferedCourses(phaseId: number) {
    if (phaseOfferedCourses.value[phaseId]) {
      return
    }
    phaseOfferedCourses.value[phaseId] = (
      await trpc.admin.enroll.offeredCourse.list.query({
        phaseId,
      })
    ).map(extendOfferedCourse)
  }

  function extendOfferedCourse<
    T extends { Course: object; moduleCode: string },
  >(offeredCourse: T): { Course: { lecturers: string[] } } & T {
    const course = courses.value.find(
      (e) => e.moduleCode === offeredCourse.moduleCode,
    )
    return {
      ...offeredCourse,
      Course: {
        ...offeredCourse.Course,
        lecturers: course?.lecturers ?? [],
      },
    }
  }
})
