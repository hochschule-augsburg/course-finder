import type {
  Course as ApiCourse,
  EnrollPhase,
  I18nJson,
  OfferedCourse,
} from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Course = Omit<ApiCourse, 'pdf'>

export type Phase = EnrollPhase

export type AdminOfferedCourse = {
  Course: { lecturers: string[]; title: I18nJson }
} & OfferedCourse

export const useAdminAssignStore = defineStore('admin-assig.lon', () => {
  //   const coursesStore = useAdminCoursesStore()
  const assignments = ref<
    Record<
      number,
      Array<
        Array<{
          count: number
          moduleCode: string
        }>
      >
    >
  >({})

  void init()
  return {
    assignments,
    fetchAssignments,
    newAssignment,
  }

  async function init() {}

  async function fetchAssignments(phaseId: number) {
    if (assignments.value[phaseId]) {
      return
    }
    assignments.value[phaseId] = await trpc.admin.assign.list.query({
      phaseId,
    })
  }

  async function newAssignment(phaseId: number) {
    const { result, tryNo } = await trpc.admin.assign.assign.mutate({
      phaseId,
    })
    if (!assignments.value[phaseId]) {
      assignments.value[phaseId] = []
    }
    assignments.value[phaseId][tryNo] = result
  }
})
