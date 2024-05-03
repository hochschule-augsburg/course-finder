import { assign } from '../../domain/assign/AssignmentAlgorithm'
import { prisma } from '../../prisma/prisma'
import { courseRouter } from '../course/CourseRoutes'
import { enrollRouter } from '../enroll/EnrollRoutes'
import { adminProcedure, router } from '../trpc'

export const adminRouter = router({
  /**
   * Temporary development api
   */
  assign: adminProcedure.mutation(async () => {
    const currentPhaseId = (await prisma.enrollphase.findFirst({}))?.id ?? 0
    const results = await assign(currentPhaseId)
    prisma.phaseAssignment.createMany({
      data: Object.entries(results).flatMap(([student, moduleCodes]) =>
        moduleCodes.map((moduleCode) => ({
          moduleCode,
          phaseId: currentPhaseId,
          username: student,
        })),
      ),
    })
    return results
  }),
  courses: courseRouter,
  enroll: enrollRouter,
})
