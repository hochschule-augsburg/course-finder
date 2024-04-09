import { courseRouter } from '../domain/course/CourseRoutes'
import { enrollRouter } from '../domain/enroll/EnrollRoutes'
import { authRouter } from '../domain/user/UserRoutes'
import { router } from './trpc'

export const appRouter = router({
  auth: authRouter,
  course: courseRouter,
  enroll: enrollRouter,
})

export type AppRouter = typeof appRouter
