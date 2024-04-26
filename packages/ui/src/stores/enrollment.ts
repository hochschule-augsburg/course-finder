import type { EnrollPhase } from '@api/prisma/PrismaTypes'
import type { CourseExtended } from '@api/routes/course/CourseRoutes'

import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useFiltersStore } from './filters'

export type Meeting = {
  from: string
  to: string
}

export type Subject = {
  allLecturers: string[]
  points: number
  selected?: boolean
} & CourseExtended

export const useEnrollmentStore = defineStore('enrollment', () => {
  const filtersStore = useFiltersStore()
  const currentPhase = ref<EnrollPhase>()
  const subjects = ref<Subject[]>([])
  const selectedSubjects = computed(() =>
    subjects.value.filter((s) => s.selected),
  )

  const filteredSubjects = computed(() => {
    let filtered: Subject[] = [...subjects.value]
    filtered = filtersStore.applyFilters(filtered)
    filtered = filtersStore.searchSubjects(filtered)
    return filtered
  })

  function enroll() {
    // TODO: api.enroll(selectedSubjects)? Algorithmus?
    trpc.enroll.upsert
  }

  void init()
  return {
    enroll,
    filteredSubjects,
    selectedSubjects,
    subjects,
  }

  async function init() {
    currentPhase.value = await trpc.course.getCurrentPhase.query()
    if (currentPhase.value) {
      const courses: CourseExtended[] =
        await trpc.course.getOfferedCourses.query({
          phaseId: currentPhase.value.id,
        })
      subjects.value = courses.map((c) => {
        return {
          ...c,
          allLecturers: [
            ...c.externLecturers,
            ...c.Lecturers.map((l) => l.name),
          ],
          points: 0,
        }
      })
      subjects.value.forEach((s) => {
        if (!s.title.de) {
          s.title.de = s.title.en
        }
        if (!s.title.en) {
          s.title.en = s.title.de
        }
      })
    }
  }
})
