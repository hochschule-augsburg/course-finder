import { adminRouter } from './admin/AdminRoutes'
import { courseRouter } from './course/CourseRoutes'
import { enrollRouter } from './enroll/EnrollRoutes'
import { router } from './trpc'
import { authRouter } from './user/UserRoutes'

export const appRouter = router({
  admin: adminRouter,
  auth: authRouter,
  course: courseRouter,
  enroll: enrollRouter,
})

export type AppRouter = typeof appRouter
