import { z } from 'zod'

import { i18nInput, jsonAppointmentsSpec } from '../../../prisma/PrismaZod'
import { prisma } from '../../../prisma/prisma'
import { adminProcedure, router } from '../../trpc'

const offeredCourseSpec = z.object({
  appointments: jsonAppointmentsSpec,
  extraInfo: z.string().optional(),
  for: z.array(z.string()),
  maxParticipants: z.number(),
  minParticipants: z.number().optional(),
  moduleCode: z.string(),
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
          end: z.string(),
          offeredCourses: z.array(offeredCourseSpec),
          start: z.string(),
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
        return await prisma.enrollphase.findUnique({
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
      }),
    list: adminProcedure.query(async () => {
      return await prisma.enrollphase.findMany({
        select: { id: true, start: true },
      })
    }),
  },
})
