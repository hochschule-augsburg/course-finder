import type { Course as ApiCourse } from '@workspace/api/src/prisma/PrismaTypes'

import { trpc } from '@/api/trpc'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Course = Omit<ApiCourse, 'pdf'>

export const useAdminCoursesStore = defineStore('admin-courses', () => {
  const courses = ref<Course[]>([])

  const phases = ref()

  void init()

  return { courses, phases }

  async function init() {
    courses.value = await trpc.admin.courses.list.query()
  }
})
