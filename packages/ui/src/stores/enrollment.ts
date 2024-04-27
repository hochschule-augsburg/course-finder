import type {
  EnrolledCourse as _EnrolledCourse,
  EnrollPhase,
} from '@api/prisma/PrismaTypes'
import type { CourseExtended } from '@api/routes/course/CourseRoutes'

import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { useUserStore } from './UserStore'
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

export type EnrolledCourse = _EnrolledCourse & {
  title?: {
    de?: string
    en?: string
  }
}

export const useEnrollmentStore = defineStore('enrollment', () => {
  const userStore = useUserStore()
  const filtersStore = useFiltersStore()
  const currentPhase = ref<EnrollPhase>()
  const maxPoints = ref(1000)
  const subjects = ref<Subject[]>([])
  const selectedSubjects = computed(() =>
    subjects.value.filter((s) => s.selected),
  )
  const enrolledCourses = ref<EnrolledCourse[]>([])

  const filteredSubjects = computed(() => {
    let filtered: Subject[] = [...subjects.value]
    filtered = filtersStore.applyFilters(filtered)
    filtered = filtersStore.searchSubjects(filtered)
    return filtered
  })

  watch(userStore, async () => {
    await init()
  })

  function enroll() {
    if (currentPhase.value) {
      return trpc.enroll.bulk.mutate({
        data: selectedSubjects.value.map((s) => {
          return { moduleCode: s.moduleCode, points: s.points }
        }),
        phaseId: currentPhase.value.id,
      })
    }
  }

  void init()
  return {
    currentPhase,
    enroll,
    enrolledCourses,
    filteredSubjects,
    init,
    maxPoints,
    selectedSubjects,
    subjects,
  }

  async function init() {
    currentPhase.value = await trpc.course.getCurrentPhase.query()
    if (currentPhase.value) {
      const enrolledCourses_tmp: _EnrolledCourse[] =
        await trpc.enroll.list.query({
          phaseId: currentPhase.value.id,
        })

      const courses: CourseExtended[] =
        await trpc.course.getOfferedCourses.query({
          phaseId: currentPhase.value.id,
        })

      enrolledCourses.value = enrolledCourses_tmp.map((c) => {
        return {
          ...c,
          title: subjects.value.find((s) => s.moduleCode === c.moduleCode)
            ?.title,
        }
      })

      subjects.value = courses.map((c) => {
        return {
          ...c,
          allLecturers: [
            ...c.externLecturers,
            ...c.Lecturers.map((l) => l.name),
          ],
          points:
            enrolledCourses.value.find((ec) => ec.moduleCode === c.moduleCode)
              ?.points ?? 0,
          selected: enrolledCourses.value.some(
            (ec) => ec.moduleCode === c.moduleCode,
          ),
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
