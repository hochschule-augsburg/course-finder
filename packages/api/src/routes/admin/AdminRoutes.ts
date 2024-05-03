import { courseRouter } from '../course/CourseRoutes'
import { enrollRouter } from '../enroll/EnrollRoutes'
import { router } from '../trpc'

export const adminRouter = router({
  courses: courseRouter,
  enroll: enrollRouter,
})
