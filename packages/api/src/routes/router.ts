import { courseRouter } from './course/CourseRoutes'
import { enrollRouter } from './enroll/EnrollRoutes'
import { router } from './trpc'
import { authRouter } from './user/UserRoutes'

export const appRouter = router({
  auth: authRouter,
  course: courseRouter,
  enroll: enrollRouter,
})

export type AppRouter = typeof appRouter
