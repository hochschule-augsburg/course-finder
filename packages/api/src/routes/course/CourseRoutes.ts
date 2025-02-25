import type { Course, OfferedCourse } from '@prisma/client'

import { z } from 'zod'

import type { CourseAppointmentsJson } from '../../prisma/PrismaTypes.ts'

import { prisma } from '../../prisma/prisma.ts'
import { publicProcedure, router, studentOnlyProcedure } from '../trpc.ts'

export type CourseExtended = {
  examTypes: string[]
  offeredCourse: {
    appointments: CourseAppointmentsJson<Date>
  } & Omit<OfferedCourse, 'appointments'>
} & Omit<Course, 'pdf'>

export const courseRouter = router({
  getCourses: publicProcedure.query(async () => {
    const courses = await prisma.course.findMany({
      orderBy: { moduleCode: 'asc' },
      select: courseFields,
      where: { published: true },
    })
    return courses.map(processCourse)
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

      const processedCourses = courses.map(processCourse)

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
          },
        }
      })
      return parsedCourses
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

// https://gitlab.informatik.tha.de/phe/fki-modulhandbuecher/-/blob/master/SharedSources/modules.sty
const examTypesData = [
  {
    keywords: ['Schriftliche Prüfung', 'Klausur', 'Written examination'],
    option: 'filter.ex.written-exam',
  },
  {
    keywords: ['Projektarbeit', 'Project work'],
    option: 'filter.ex.project-work',
  },
  {
    keywords: ['Studienarbeit', 'Written assignment'],
    option: 'filter.ex.written-assignment',
  },
  {
    keywords: ['Präsentation', 'Presentation'],
    option: 'filter.ex.presentation',
  },
  {
    keywords: ['Elektronische Prüfung', 'Electronic examination'],
    option: 'filter.ex.e-written',
  },
  {
    keywords: ['Mündliche Prüfung', 'Oral examination'],
    option: 'filter.ex.oral',
  },
]

function processCourse<T extends { exam: null | string }>(
  course: T,
): { examTypes: string[] } & T {
  const examTypes = examTypesData
    .filter((type) => {
      return type.keywords.find((keyword) => {
        return course.exam?.includes(keyword)
      })
    })
    .map((e) => e.option)

  return { ...course, examTypes: examTypes }
}

const courseFields: { [key in keyof Course]?: boolean } = {
  creditPoints: true,
  editorUsername: true,
  exam: true,
  extraInfo: true,
  faculty: true,
  infoUrl: true,
  lecturers: true,
  moduleCode: true,
  pdf: false,
  published: true,
  semesterHours: true,
  title: true,
  varyingCP: true,
}
