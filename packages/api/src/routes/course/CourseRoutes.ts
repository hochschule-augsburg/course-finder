import type { Course, OfferedCourse } from '@prisma/client'

import { z } from 'zod'

import type { CourseAppointmentsJson } from '../../prisma/PrismaTypes'

import { prisma } from '../../prisma/prisma'
import { router, studentProcedure } from '../trpc'

export type CourseExtended = {
  Lecturers: { name: string; username: string }[]
  offeredCourse: {
    appointments: CourseAppointmentsJson<Date>
  } & Omit<OfferedCourse, 'appointments'>
} & Omit<Course, 'pdf'>

export const courseRouter = router({
  getCurrentPhase: studentProcedure.query(async () => {
    return (await prisma.enrollphase.findFirst({})) ?? undefined
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
          select: {
            Faculty: true,
            Lecturers: {
              select: { User: { select: { name: true, username: true } } },
            },
            creditPoints: true,
            externLecturers: true,
            extraInfo: true,
            facultyName: true,
            infoUrl: true,
            moduleCode: true,
            offeredCourse: {
              // include only the offeredCourses that are indicated by input
              where: {
                phaseId: { equals: input.phaseId },
              },
            },
            published: true,
            semesterHours: true,
            title: true,
            varyingCP: true,
          },
          // select only the courses that have an offeredCourse included
          where: {
            offeredCourse: {
              some: {
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
          Lecturers: e.Lecturers.map((l) => ({
            name: l.User.name,
            username: l.User.username,
          })),
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
  getPdf: studentProcedure
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
