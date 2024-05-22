import { trpc } from '@/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStatsStore = defineStore('admin-stats', () => {
  const phase = ref<Record<number, { studentCount: number } | undefined>>({})
  const course = ref<
    Record<
      number,
      | Record<string, { avgPoints: number; studentCount: number } | undefined>
      | undefined
    >
  >({})

  return { course, fetchCourse, fetchPhase, phase }

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
})
