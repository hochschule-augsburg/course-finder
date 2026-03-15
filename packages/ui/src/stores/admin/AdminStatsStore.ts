import { defineStore } from 'pinia'
import { ref } from 'vue'

import { trpc } from '@/trpc'

export const useAdminStatsStore = defineStore('admin-stats', () => {
  const phase = ref<Record<number, undefined | { studentCount: number }>>({})
  const course = ref<
    Record<
      number,
      | Record<string, undefined | { avgPoints: number; studentCount: number }>
      | undefined
    >
  >({})
  const byFieldOfStudy = ref<
    Record<number, Record<string, undefined | { count: number }> | undefined>
  >({})

  return {
    byFieldOfStudy,
    course,
    fetchByFieldOfStudy,
    fetchCourse,
    fetchPhase,
    phase,
  }

  async function fetchPhase(phaseId: number) {
    phase.value[phaseId] = await trpc.admin.enroll.statistics.phase.query({
      phaseId,
    })
  }

  async function fetchCourse(phaseId: number) {
    course.value[phaseId] =
      await trpc.admin.enroll.statistics.courseEnrollments.query({
        phaseId,
      })
  }

  async function fetchByFieldOfStudy(phaseId: number) {
    byFieldOfStudy.value[phaseId] =
      await trpc.admin.enroll.statistics.enrollmentsByFieldOfStudy.query({
        phaseId,
      })
  }
})
