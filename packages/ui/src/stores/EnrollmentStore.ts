import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import type { Subject } from './CoursesStore'

import { useCoursesStore } from './CoursesStore'
import { useUserStore } from './UserStore'

export type EnrolledCourse = {
  moduleCode: string
  points: number
  title: { de?: string; en?: string }
}

export const MAX_POINTS = 1000

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
  const userStore = useUserStore()
  const coursesStore = useCoursesStore()

  const enrolledSubjects = ref<EnrolledCourse[]>([])

  watch(
    [() => userStore.user, () => coursesStore.currentPhase],
    ([user, phase]) => {
      if (user?.type !== 'Student' || !phase) {
        enrolledSubjects.value = []
      }
      void init()
    },
    { immediate: true },
  )

  return { addSubject, enroll, enrolledSubjects, removeSubject }

  async function init() {
    if (!coursesStore.currentPhase) {
      return
    }
    enrolledSubjects.value = (
      await trpc.enroll.list.query({
        phaseId: coursesStore.currentPhase.id,
      })
    ).map(extendEnrolled)
  }

  function enroll() {
    if (coursesStore.currentPhase) {
      return trpc.enroll.bulk.mutate({
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

      enrolledSubjects.value.splice(index, 1)

      await trpc.enroll.delete.mutate({
        moduleCode,
        phaseId: coursesStore.currentPhase.id,
      })
    }
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
      title: course.title,
    }
  }
})
