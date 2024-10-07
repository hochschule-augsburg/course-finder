import { trpc } from '@/trpc'
import { differenceBy } from 'lodash-es'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAdminCoursesStore } from './AdminCoursesStore'
import { useAdminStatsStore } from './AdminStatsStore'

export const useAdminAssignStore = defineStore('admin-assign', () => {
  const coursesStore = useAdminCoursesStore()
  const statStore = useAdminStatsStore()
  const assignmentsRaw = ref<
    Record<
      number,
      Array<
        Array<{
          assignCount: number
          moduleCode: string
        }>
      >
    >
  >({})
  const assignments = computed(() => {
    return Object.fromEntries(
      Object.entries(assignmentsRaw.value).map(([phaseId, tries]) => {
        const offeredCoursesNotExtern = coursesStore.phaseOfferedCourses[
          Number(phaseId)
        ].filter((e) => !e.externalRegistration)
        console.log({ offeredCoursesNotExtern })
        return [
          phaseId,
          tries.map((tryNo) => {
            const notAssignedCourses = differenceBy(
              offeredCoursesNotExtern,
              tryNo,
              (e) => e.moduleCode,
            )
            return [
              ...tryNo.map((trie) => ({
                ...trie,
                Course: offeredCoursesNotExtern?.find(
                  (e) => e.moduleCode === trie.moduleCode,
                ),
                studentCount:
                  statStore.course[Number(phaseId)]?.[trie.moduleCode]
                    ?.studentCount ?? 0,
              })),
              ...notAssignedCourses.map((e) => ({
                assignCount: 0,
                Course: e,
                moduleCode: e.moduleCode,
                studentCount:
                  statStore.course[Number(phaseId)]?.[e.moduleCode]
                    ?.studentCount ?? 0,
              })),
            ]
          }),
        ]
      }),
    )
  })

  void init()
  return {
    assignments,
    fetchAssignments,
    newAssignment,
    publish,
  }

  async function init() {}

  async function fetchAssignments(phaseId: number) {
    if (assignments.value[phaseId]) {
      return
    }
    assignmentsRaw.value[phaseId] = await trpc.admin.assign.list.query({
      phaseId,
    })
  }

  async function publish(phaseId: number, tryNo: number) {
    await trpc.admin.assign.publish.mutate({
      phaseId,
      tryNo,
    })
    coursesStore.phases[phaseId].state = 'FINISHED'
  }

  async function newAssignment(phaseId: number) {
    const { result, tryNo } = await trpc.admin.assign.assign.mutate({
      phaseId,
    })
    if (!assignments.value[phaseId]) {
      assignments.value[phaseId] = []
    }
    assignmentsRaw.value[phaseId][tryNo] = result
    return tryNo
  }
})
