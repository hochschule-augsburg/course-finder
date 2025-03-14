import { PhaseState } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { sumBy } from 'lodash-es'
import { z } from 'zod'

import {
  ACTIVE_PHASE_STATES,
  PhaseService,
  phaseSpec,
} from '../../../domain/phase/PhaseService.ts'
import { prisma } from '../../../prisma/prisma.ts'
import {
  offeredCourseSpec,
  zodEnumFromObjKeys,
} from '../../../prisma/PrismaZod.ts'
import { adminProcedure, router } from '../../trpc.ts'

export const enrollRouter = router({
  offeredCourse: {
    create: adminProcedure
      .input(z.array(offeredCourseSpec.extend({ phaseId: z.number() })))
      .mutation(({ input }) => {
        return prisma.offeredCourse.createMany({
          data: input,
        })
      }),
    delete: adminProcedure
      .input(z.object({ moduleCode: z.string(), phaseId: z.number() }))
      .mutation(({ input }) => {
        return prisma.offeredCourse.delete({
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
        )
          .map((course) => ({
            ...course,
            appointments: {
              dates: course.appointments.dates.map((date) => ({
                from: new Date(date.from),
                to: new Date(date.to),
              })),
              type: course.appointments.type,
            },
          }))
          .toSorted((a, b) => {
            if (a.externalRegistration && !b.externalRegistration) return 1
            if (!a.externalRegistration && b.externalRegistration) return -1
            return (a.Course.title.de ?? '').localeCompare(
              b.Course.title.de ?? '',
            )
          })
      }),
    update: adminProcedure
      .input(
        offeredCourseSpec
          .partial()
          .extend({ moduleCode: z.string(), phaseId: z.number() }),
      )
      .mutation(({ input }) => {
        const { moduleCode, phaseId, ...data } = input
        return prisma.offeredCourse.update({
          data,
          where: {
            phaseId_moduleCode: { moduleCode, phaseId },
          },
        })
      }),
  },
  phase: {
    create: adminProcedure.input(phaseSpec).mutation(({ input }) => {
      return PhaseService.createPhase(input)
    }),
    delete: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .mutation(({ input }) => {
        return PhaseService.deletePhase(input.phaseId)
      }),
    get: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        const result = await prisma.enrollphase.findUnique({
          include: {
            offeredCourses: {
              select: {
                appointments: true,
                Course: {
                  select: { lecturers: true, title: true },
                },
                externalRegistration: true,
                extraInfo: true,
                for: true,
                hideMinParticipants: true,
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
          offeredCourses: result.offeredCourses
            .map((course) => ({
              ...course,
              appointments: {
                dates: course.appointments.dates.map(({ from, to }) => ({
                  from: new Date(from),
                  to: new Date(to),
                })),
                type: course.appointments.type,
              },
              moodleCourse: null,
            }))
            .toSorted((a, b) => {
              if (a.externalRegistration && !b.externalRegistration) return 1
              if (!a.externalRegistration && b.externalRegistration) return -1
              return (a.Course.title.de ?? '').localeCompare(
                b.Course.title.de ?? '',
              )
            }),
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
    sendOpeningMail: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .mutation(async ({ input }) => {
        await PhaseService.sendOpeningMail(input.phaseId)
      }),
    sendReminderMail: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .mutation(async ({ input }) => {
        await PhaseService.sendReminderMails(input.phaseId)
      }),
    update: adminProcedure
      .input(phaseSpec.partial().extend({ id: z.number() }))
      .mutation(({ input }) => {
        return PhaseService.updatePhase(input.id, input)
      }),
    updateState: adminProcedure
      .input(
        z.object({ id: z.number(), state: zodEnumFromObjKeys(PhaseState) }),
      )
      .mutation(async ({ input }) => {
        if (ACTIVE_PHASE_STATES.includes(input.state)) {
          const result = await prisma.enrollphase.findFirst({
            where: {
              id: { not: input.id },

              state: { in: ACTIVE_PHASE_STATES as PhaseState[] },
            },
          })
          if (result) {
            return {
              error: 'a-phase-is-already-active',
              phase: result,
            }
          }
        }
        return prisma.enrollphase.update({
          data: { state: input.state },
          where: { id: input.id },
        })
      }),
  },
  statistics: {
    courseEnrollments: adminProcedure
      .input(z.object({ phaseId: z.number() }))
      .query(async ({ input }) => {
        const arrayStats = (
          await prisma.offeredCourse.findMany({
            select: {
              moduleCode: true,
              StudentChoice: { select: { points: true } },
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
