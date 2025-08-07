import type { Course, OfferedCourse } from '@prisma/client'

import { z } from 'zod'

import type { CourseAppointmentsJson } from '../../prisma/PrismaTypes.ts'

import { prisma } from '../../prisma/prisma.ts'
import { publicProcedure, router, studentOnlyProcedure } from '../trpc.ts'
import { processCourse } from './CourseUtils.ts'

export type CourseExtended = Omit<Course, 'pdf'> & {
  examTypes: string[]
  offeredCourse: Omit<OfferedCourse, 'appointments' | 'minParticipants'> & {
    appointments: CourseAppointmentsJson<Date>
    minParticipants: null | number
  }
}

export const courseRouter = router({
  getCourses: publicProcedure.query(async ({ ctx }) => {
    const courses = await prisma.course.findMany({
      orderBy: { moduleCode: 'asc' },
      select: courseFields,
      where: { published: true },
    })
    return courses.map((e) => processCourse(e, ctx.user?.Student))
  }),
  getCurrentPhase: studentOnlyProcedure.query(() => {
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
      const courses = await prisma.course.findMany({
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

      const processedCourses = courses.map((e) =>
        processCourse(e, ctx.user.Student),
      )

      const parsedCourses = processedCourses.map((e) => {
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
            minParticipants: offeredCourse.hideMinParticipants
              ? null
              : offeredCourse.minParticipants,
          },
        }
      })
      return parsedCourses
    }),
  getPdf: publicProcedure
    .input(z.object({ moduleCode: z.string() }))
    .query(async ({ input }) => {
      const course = await prisma.course.findFirst({
        select: { maPdf: true, pdf: true },
        where: {
          moduleCode: input.moduleCode,
        },
      })
      if (!course) {
        throw new Error(`Course with moduleCode ${input.moduleCode} not found`)
      }
      return {
        maPdf: course.maPdf ? new Int8Array(course.maPdf) : null,
        pdf: course.pdf ? new Int8Array(course.pdf) : null,
      }
    }),
})

const courseFields: { [key in keyof Course]: boolean } = {
  creditPoints: true,
  editorUsername: true,
  exam: true,
  extraInfo: true,
  faculty: true,
  infoUrl: true,
  lecturers: true,
  maExam: true,
  maPdf: false,
  minFocus: true,
  moduleCode: true,
  pdf: false,
  published: true,
  semesterHours: true,
  title: true,
  varyingCP: true,
}
