import { router } from '../trpc.ts'
import { assignRouter } from './assign/AdminAssignRoutes.ts'
import { coursesRoutes } from './courses/AdminCoursesRoutes.ts'
import { enrollRouter } from './enroll/AdminEnrollRoutes.ts'

export const adminRouter = router({
  assign: assignRouter,
  courses: coursesRoutes,
  enroll: enrollRouter,
})
