import type { Course, OfferedCourse } from '@prisma/client'

import { z } from 'zod'

import { prisma } from '../../prisma'
import { router, studentProcedure } from '../../router/trpc'

export type CourseExtended = {
  offeredCourse: OfferedCourse
} & Course

export const courseRouter = router({
  getCurrentPhase: studentProcedure.query(async () => {
    return (
      (await prisma.enrollphase.findFirst({
        where: {
          end: {
            gte: new Date(),
          },
          start: {
            lte: new Date(),
          },
        },
      })) ?? undefined
    )
  }),
  getOfferedCourses: studentProcedure
    .input(
      z.object({
        phaseId: z.number(),
      }),
    )
    .query(async ({ input }): Promise<CourseExtended[]> => {
      return (
        await prisma.course.findMany({
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
      ).map((e) => {
        const offeredCourse = e.offeredCourse
        if (offeredCourse === null) {
          throw new Error(
            `Course ${JSON.stringify(e)} unexpectedly has no offeredCourse`,
          )
        }
        return {
          ...e,
          offeredCourse,
        }
      })
    }),
})
