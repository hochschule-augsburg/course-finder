import { TRPCError } from '@trpc/server'
import { sumBy } from 'lodash-es'
import { z } from 'zod'

import { phaseService, phaseSpec } from '../../../domain/phase/PhaseService'
import { offeredCourseSpec } from '../../../prisma/PrismaZod'
import { prisma } from '../../../prisma/prisma'
import { adminProcedure, router } from '../../trpc'

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
      .query(async ({ input }) => {
        return (
          await prisma.offeredCourse.findMany({
            include: { Course: { select: { moduleCode: true, title: true } } },
            orderBy: [{ externalRegistration: 'asc' }, { moduleCode: 'asc' }],
            where: { phaseId: input.phaseId },
          })
        ).map((course) => ({
          ...course,
          appointments: {
            dates: course.appointments.dates.map((date) => ({
              from: new Date(date.from),
              to: new Date(date.to),
            })),
            type: course.appointments.type,
          },
        }))
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
    create: adminProcedure.input(phaseSpec).mutation(({ input }) => {
      return phaseService.createPhase(input)
    }),
    delete: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .mutation(({ input }) => {
        return phaseService.deletePhase(input.phaseId)
      }),
    get: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        const result = await prisma.enrollphase.findUnique({
          include: {
            offeredCourses: {
              select: {
                Course: {
                  select: { lecturers: true, title: true },
                },
                appointments: true,
                externalRegistration: true,
                extraInfo: true,
                for: true,
                maxParticipants: true,
                minParticipants: true,
                moduleCode: true,
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
            moodleCourse: null,
          })),
        }
      }),
    list: adminProcedure.query(async () => {
      return Object.fromEntries(
        (
          await prisma.enrollphase.findMany({
            orderBy: {
              start: 'asc',
            },
          })
        ).map((phase) => [phase.id, phase]),
      )
    }),
    update: adminProcedure
      .input(phaseSpec.partial().extend({ id: z.number() }))
      .mutation(async ({ input }) => {
        return phaseService.updatePhase(input.id, input)
      }),
  },
  statistics: {
    courseEnrollments: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        const arrayStats = (
          await prisma.offeredCourse.findMany({
            select: {
              StudentChoice: { select: { points: true } },
              moduleCode: true,
            },
            where: { phaseId: input.phaseId },
          })
        ).map((course) => ({
          avgPoints:
            sumBy(course.StudentChoice, (choice) => choice.points) /
              course.StudentChoice.length || 0,
          moduleCode: course.moduleCode,
          studentCount: course.StudentChoice.length,
        }))

        return Object.fromEntries(
          arrayStats.map((course) => [course.moduleCode, course]),
        )
      }),
    phase: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        return {
          studentCount: (
            await prisma.studentChoice.findMany({
              distinct: ['username'],
              where: { phaseId: input.phaseId },
            })
          ).length,
        }
      }),
  },
})
