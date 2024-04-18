import { z } from 'zod'

import { prisma } from '../../prisma'
import { router, studentProcedure } from '../../router/trpc'

export const courseRouter = router({
  getCurrentPhase: studentProcedure.query(() => {
    return prisma.enrollphase.findFirst({
      where: {
        end: {
          gte: new Date(),
        },
        start: {
          lte: new Date(),
        },
      },
    })
  }),
  getOfferedCourses: studentProcedure
    .input(
      z.object({
        phaseId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.course.findMany({
        include: {
          Faculty: true,
          offeredCourse: {
            // include only the offeredCourses that are indicated by input
            where: {
              phaseId: { equals: input.phaseId },
            },
          },
        },
        // select only the courses that have an offeredCourse included
        where: {
          offeredCourse: {
            phaseId: { equals: input.phaseId },
          },
        },
      })
    }),
})
