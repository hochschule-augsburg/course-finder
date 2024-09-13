import { adminRouter } from './admin/AdminRoutes.ts'
import { appConfRoutes } from './app-conf-routes.ts'
import { assignRouter } from './assign-routes.ts'
import { courseRouter } from './course/CourseRoutes.ts'
import { enrollRouter } from './enroll/EnrollRoutes.ts'
import { router } from './trpc.ts'
import { authRouter } from './user/UserRoutes.ts'

export const appRouter = router({
  admin: adminRouter,
  appConf: appConfRoutes,
  assign: assignRouter,
  auth: authRouter,
  course: courseRouter,
  enroll: enrollRouter,
})

export type AppRouter = typeof appRouter
