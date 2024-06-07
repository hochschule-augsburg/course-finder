import { adminRouter } from './admin/AdminRoutes'
import { assignRouter } from './assign-routes'
import { courseRouter } from './course/CourseRoutes'
import { enrollRouter } from './enroll/EnrollRoutes'
import { router } from './trpc'
import { authRouter } from './user/UserRoutes'

export const appRouter = router({
  admin: adminRouter,
  assign: assignRouter,
  auth: authRouter,
  course: courseRouter,
  enroll: enrollRouter,
})

export type AppRouter = typeof appRouter
