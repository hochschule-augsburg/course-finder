import { router } from '../trpc'
import { assignRouter } from './assign/AssignRoutes'
import { coursesRoutes } from './courses/AdminCoursesRoutes'
import { enrollRouter } from './enroll/AdminEnrollRoutes'

export const adminRouter = router({
  assign: assignRouter,
  courses: coursesRoutes,
  enroll: enrollRouter,
})
