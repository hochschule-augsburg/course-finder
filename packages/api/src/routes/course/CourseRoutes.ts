import type { Course, OfferedCourse } from '@prisma/client'

import { z } from 'zod'

import type { CourseAppointmentsJson } from '../../prisma/PrismaTypes'

import { prisma } from '../../prisma/prisma'
import { publicProcedure, router, studentOnlyProcedure } from '../trpc'

export type CourseExtended = {
  offeredCourse: {
    appointments: CourseAppointmentsJson<Date>
  } & Omit<OfferedCourse, 'appointments'>
} & Omit<Course, 'pdf'>

export const courseRouter = router({
  getCourses: publicProcedure.query(async () => {
    return await prisma.course.findMany({
      orderBy: { moduleCode: 'asc' },
      select: courseFields,
      where: { published: true },
    })
  }),
  getCurrentPhase: studentOnlyProcedure.query(async () => {
    return prisma.enrollphase.findFirst({
      where: {
        state: { in: ['OPEN', 'CLOSED', 'DRAWING'] },
      },
    })
  }),
  getOfferedCourses: studentOnlyProcedure
    .input(
      z.object({
        phaseId: z.number(),
      }),
    )
    .query(async ({ ctx, input }): Promise<CourseExtended[]> => {
      return (
        await prisma.course.findMany({
          orderBy: { moduleCode: 'asc' },
          select: {
            ...courseFields,
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
              some: {
                for: { has: ctx.user.Student.fieldOfStudy },
                phaseId: { equals: input.phaseId },
              },
            },
          },
        })
      ).map((e) => {
        const offeredCourse = e.offeredCourse[0]
        if (!offeredCourse) {
          throw new Error(
            `Course ${JSON.stringify(e)} unexpectedly has no offeredCourse`,
          )
        }
        return {
          ...e,
          offeredCourse: {
            ...offeredCourse,
            appointments: {
              ...offeredCourse.appointments,
              dates: offeredCourse.appointments.dates.map((d) => ({
                from: new Date(d.from),
                to: new Date(d.to),
              })),
            },
          },
        }
      })
    }),
  getPdf: publicProcedure
    .input(z.object({ moduleCode: z.string() }))
    .query(async ({ input }) => {
      const course = await prisma.course.findFirst({
        select: { pdf: true },
        where: {
          moduleCode: input.moduleCode,
        },
      })
      if (!course) {
        throw new Error(`Course with moduleCode ${input.moduleCode} not found`)
      }
      return { pdf: course.pdf ? new Int8Array(course.pdf) : null }
    }),
})

export const courseFields: { [key in 'Faculty' | keyof Course]?: boolean } = {
  Faculty: true,
  creditPoints: true,
  editorUsername: true,
  extraInfo: true,
  facultyName: true,
  infoUrl: true,
  lecturers: true,
  moduleCode: true,
  pdf: false,
  published: true,
  semesterHours: true,
  title: true,
  varyingCP: true,
}
