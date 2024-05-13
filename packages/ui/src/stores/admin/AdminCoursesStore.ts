import type {
  Course as ApiCourse,
  EnrollPhase,
} from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/api/trpc'
import { useAsyncState } from '@vueuse/core'
import { isWithinInterval } from 'date-fns'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type Course = Omit<ApiCourse, 'pdf'>

export type Phase = EnrollPhase

export const useAdminCoursesStore = defineStore('admin-courses', () => {
  const courses = ref<Course[]>([])
  const phases = ref<Phase[]>([])

  const currentPhase = computed(() => {
    return phases.value.find((e) =>
      isWithinInterval(new Date(), {
        end: new Date(e.end),
        start: new Date(e.start),
      }),
    )
  })

  return {
    courses,
    currentPhase,
    isInit: useAsyncState(async () => {
      await init()
      return true
    }, false).state,
    phases,
  }

  async function init() {
    await Promise.all([
      (async () => (courses.value = await trpc.admin.courses.list.query()))(),
      (async () =>
        (phases.value = await trpc.admin.enroll.phase.list.query()))(),
    ])
  }
})
