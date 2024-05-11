import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import {
  i18nInput,
  jsonAppointmentsSpec,
  nullString,
} from '../../../prisma/PrismaZod'
import { prisma } from '../../../prisma/prisma'
import { adminProcedure, router } from '../../trpc'

const offeredCourseSpec = z.object({
  appointments: jsonAppointmentsSpec,
  extraInfo: nullString,
  for: z.array(z.string()),
  maxParticipants: z.number().nullable().optional(),
  minParticipants: z.number(),
  moduleCode: z.string(),
  moodleCourse: nullString,
})

export const enrollRouter = router({
  offeredCourse: {
    create: adminProcedure
      .input(z.array(offeredCourseSpec.extend({ phaseId: z.number() })))
      .mutation(async ({ input }) => {
        return await prisma.offeredCourse.createMany({
          data: input,
        })
      }),
    delete: adminProcedure
      .input(z.object({ moduleCode: z.string(), phaseId: z.number() }))
      .mutation(async ({ input }) => {
        return await prisma.offeredCourse.delete({
          where: {
            phaseId_moduleCode: {
              moduleCode: input.moduleCode,
              phaseId: input.phaseId,
            },
          },
        })
      }),
    list: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async () => {
        return await prisma.offeredCourse.findMany({
          include: { Course: { select: { moduleCode: true, title: true } } },
          orderBy: { moduleCode: 'asc' },
        })
      }),
    update: adminProcedure
      .input(
        offeredCourseSpec
          .partial()
          .extend({ moduleCode: z.string(), phaseId: z.number() }),
      )
      .mutation(async ({ input }) => {
        const { moduleCode, phaseId, ...data } = input
        return await prisma.offeredCourse.update({
          data,
          where: {
            phaseId_moduleCode: { moduleCode, phaseId },
          },
        })
      }),
  },
  phase: {
    create: adminProcedure
      .input(
        z.object({
          description: i18nInput,
          end: z.date(),
          offeredCourses: z.array(offeredCourseSpec),
          start: z.date(),
          title: i18nInput,
        }),
      )
      .mutation(({ input }) => {
        return prisma.enrollphase.create({
          data: {
            description: input.description,
            end: input.end,
            offeredCourses: {
              create: input.offeredCourses.map((course) => ({
                Course: {
                  connect: {
                    moduleCode: course.moduleCode,
                  },
                },
                appointments: course.appointments,
                extraInfo: course.extraInfo,
                for: { set: course.for },
                maxParticipants: course.maxParticipants,
                minParticipants: course.minParticipants,
              })),
            },
            start: input.start,
            title: input.title,
          },
        })
      }),
    get: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        const result = await prisma.enrollphase.findUnique({
          include: {
            offeredCourses: {
              select: {
                Course: {
                  select: { lecturers: true, moduleCode: true, title: true },
                },
                appointments: true,
                extraInfo: true,
                for: true,
                maxParticipants: true,
                minParticipants: true,
              },
            },
          },
          where: { id: input.phaseId },
        })
        if (!result) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Phase not found' })
        }

        return {
          ...result,
          offeredCourses: result.offeredCourses.map((course) => ({
            ...course,
            appointments: {
              dates: course.appointments.dates.map(({ from, to }) => ({
                from: new Date(from),
                to: new Date(to),
              })),
              type: course.appointments.type,
            },
          })),
        }
      }),
    getCurrentPhase: adminProcedure.query(async () => {
      return (await prisma.enrollphase.findFirst({})) ?? undefined
    }),
    list: adminProcedure.query(async () => {
      return await prisma.enrollphase.findMany({
        orderBy: {
          start: 'desc',
        },
      })
    }),
  },
})
