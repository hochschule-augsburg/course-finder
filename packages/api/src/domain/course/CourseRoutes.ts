import { z } from 'zod'

import { prisma } from '../../prisma'
import { router, studentProcedure } from '../../router/trpc'

export const courseRouter = router({
  getCourses: studentProcedure
    .input(
      z.object({
        phaseId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.course.findMany({
        include: {
          Faculty: true,
          offeredCourses: {
            where: {
              phaseId: { equals: input.phaseId },
            },
          },
        },
        where: {
          offeredCourses: {
            some: {
              phaseId: { equals: input.phaseId },
            },
          },
        },
      })
    }),
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
})
