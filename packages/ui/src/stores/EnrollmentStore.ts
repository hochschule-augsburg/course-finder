import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import type { Subject } from './CoursesStore'

import { useCoursesStore } from './CoursesStore'

export type EnrolledCourse = {
  autoFillOption: 'fallback' | 'prio'
  moduleCode: string
  points: number
  title: { de?: string; en?: string }
}

export const MAX_POINTS = 100

export function useCourseEnroll(subject: Subject) {
  const enrollmentStore = useEnrollmentStore()
  return {
    modelValue: computed(() =>
      enrollmentStore.enrolledSubjects.find(
        (e) => e.moduleCode === subject.moduleCode,
      ),
    ),
    update: (value: boolean) => {
      if (value) {
        void enrollmentStore.addSubject(subject.moduleCode)
      } else {
        void enrollmentStore.removeSubject(subject.moduleCode)
      }
    },
  }
}

export const useEnrollmentStore = defineStore('enrollment', () => {
  const coursesStore = useCoursesStore()

  const enrolledSubjects = ref<EnrolledCourse[]>([])

  watch(
    () => coursesStore.currentPhase,
    () => {
      void update()
    },
    { immediate: true },
  )

  return { addSubject, enroll, enrolledSubjects, removeSubject }

  async function update() {
    if (!coursesStore.currentPhase) {
      enrolledSubjects.value = []
      return
    }
    enrolledSubjects.value = (
      await trpc.enroll.list.query({
        phaseId: coursesStore.currentPhase.id,
      })
    ).map(extendEnrolled)
  }

  function enroll(creditsNeeded: number) {
    if (coursesStore.currentPhase) {
      return trpc.enroll.bulk.mutate({
        creditsNeeded: creditsNeeded,
        data: enrolledSubjects.value,
        phaseId: coursesStore.currentPhase.id,
      })
    }
  }

  async function addSubject(moduleCode: string) {
    if (coursesStore.currentPhase) {
      enrolledSubjects.value.push(
        extendEnrolled({
          moduleCode,
          points: 0,
        }),
      )
      await trpc.enroll.upsert.mutate({
        creditsNeeded: undefined,
        moduleCode,
        phaseId: coursesStore.currentPhase.id,
        points: 0,
      })
    }
  }

  async function removeSubject(moduleCode: string) {
    if (coursesStore.currentPhase) {
      const index = enrolledSubjects.value.findIndex(
        (e) => e.moduleCode === moduleCode,
      )

      const remPoints = enrolledSubjects.value[index].points
      enrolledSubjects.value.splice(index, 1)

      await splitRemPoints(remPoints)

      await trpc.enroll.delete.mutate({
        moduleCode,
        phaseId: coursesStore.currentPhase.id,
      })
    }
  }

  function splitRemPoints(remPoints: number) {
    const extraPoints = Math.floor(remPoints / enrolledSubjects.value.length)

    enrolledSubjects.value.forEach((s) => {
      s.points += extraPoints
      remPoints -= extraPoints
    })

    enrolledSubjects.value.forEach((s) => {
      if (remPoints > 0) {
        s.points++
        remPoints--
      }
    })

    return Promise.all(
      enrolledSubjects.value.map(
        (s) =>
          coursesStore.currentPhase?.id &&
          trpc.enroll.upsert.mutate({
            creditsNeeded: undefined,
            moduleCode: s.moduleCode,
            phaseId: coursesStore.currentPhase.id,
            points: s.points,
          }),
      ),
    )
  }

  function extendEnrolled(enrolled: {
    moduleCode: string
    points: number
  }): EnrolledCourse {
    const course = coursesStore.subjects.find(
      (subject) => subject.moduleCode === enrolled.moduleCode,
    )
    if (!course) {
      throw new Error('Course not found')
    }
    return {
      ...enrolled,
      autoFillOption: 'prio',
      title: course.title,
    }
  }
})
