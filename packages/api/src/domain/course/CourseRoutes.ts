import { z } from 'zod'

import type { I18nJson, courseAppointmentsJson } from '../../prisma/PrismaTypes'

import { prisma } from '../../prisma'
import { router, studentProcedure } from '../../router/trpc'

type frontendCourse = {
  cp: number
  description: I18nJson
  id: string
  info: null | string
  maxTnm: null | number
  meetings: courseAppointmentsJson | null
  minTnm: null | number
  name: I18nJson
  prof: string[]
  sws: number
}

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
      const query = await prisma.course.findMany({
        include: {
          Faculty: true,
          offeredCourse: {
            where: {
              phaseId: { equals: input.phaseId },
            },
          },
        },
        where: {
          offeredCourse: {
            phaseId: { equals: input.phaseId },
          },
        },
      })
      const result: frontendCourse[] = []
      for (let i = 0; i < query.length; i++) {
        const course = query[i]
        result.push({
          cp: course.creditPoints,
          description: course.description,
          id: course.moduleCode,
          info: course.offeredCourse ? course.offeredCourse.extraInfo : null,
          maxTnm: course.offeredCourse
            ? course.offeredCourse.maxParticipants
            : null,
          meetings: course.offeredCourse
            ? course.offeredCourse.appointments
            : null,
          minTnm: course.offeredCourse
            ? course.offeredCourse.minParticipants
            : null,
          name: course.title,
          prof: course.lecturerNames,
          sws: course.semesterHours,
        })
      }
      return result
    }),
})
