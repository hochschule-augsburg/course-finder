import { trpc } from '@/trpc'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAdminCoursesStore } from './AdminCoursesStore'

export const useAdminAssignStore = defineStore('admin-assign', () => {
  const coursesStore = useAdminCoursesStore()
  const assignmentsRaw = ref<
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
  const assignments = computed(() => {
    return Object.fromEntries(
      Object.entries(assignmentsRaw.value).map(([phaseId, tries]) => {
        return [
          phaseId,
          tries.map((tryNo) => {
            return tryNo.map((trie) => ({
              ...trie,
              Course: coursesStore.phaseOfferedCourses[Number(phaseId)]?.find(
                (e) => e.moduleCode === trie.moduleCode,
              ),
            }))
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
