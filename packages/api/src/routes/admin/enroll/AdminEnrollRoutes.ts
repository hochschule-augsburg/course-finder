import { TRPCError } from '@trpc/server'
import { groupBy, sumBy } from 'lodash-es'
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
  externalRegistration: z.boolean().optional(),
  extraInfo: nullString,
  for: z.array(z.string()),
  maxParticipants: z.number().nullable().optional(),
  minParticipants: z.number(),
  moduleCode: z.string(),
  moodleCourse: nullString,
})

const phaseSpec = z.object({
  description: i18nInput,
  end: z.date(),
  offeredCourses: z.array(offeredCourseSpec),
  start: z.date(),
  title: i18nInput,
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
      return prisma.enrollphase.create({
        data: {
          description: {
            de: input.description.de ?? input.description.en,
            en: input.description.en ?? input.description.de,
          },
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
              moodleCourse: course.moodleCourse,
            })),
          },
          start: input.start,
          title: {
            de: input.title.de ?? input.title.en,
            en: input.title.en ?? input.title.de,
          },
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
    getCurrentPhase: adminProcedure.query(async () => {
      return (await prisma.enrollphase.findFirst({})) ?? undefined
    }),
    list: adminProcedure.query(async () => {
      return await prisma.enrollphase.findMany({
        orderBy: {
          start: 'asc',
        },
      })
    }),
    update: adminProcedure
      .input(phaseSpec.extend({ id: z.number() }))
      .mutation(async ({ input }) => {
        const originalOfferedCourses = await prisma.offeredCourse.findMany({
          where: { phaseId: input.id },
        })

        const deleted = originalOfferedCourses.filter(
          (course) =>
            !input.offeredCourses.some(
              (newCourse) => newCourse.moduleCode === course.moduleCode,
            ),
        )
        const { newCourses, updated } = groupBy(
          input.offeredCourses,
          (course) =>
            originalOfferedCourses.find(
              (oldCourse) => oldCourse.moduleCode === course.moduleCode,
            )
              ? 'updated'
              : 'newCourses',
        )

        await Promise.all([
          prisma.offeredCourse.deleteMany({
            where: {
              moduleCode: { in: deleted.map((c) => c.moduleCode) },
              phaseId: input.id,
            },
          }),
          prisma.offeredCourse.createMany({
            data:
              newCourses?.map((course) => ({
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
                moduleCode: course.moduleCode,
                moodleCourse: course.moodleCourse,
                phaseId: input.id,
              })) ?? [],
          }),
          ...updated.map((course) =>
            prisma.offeredCourse.update({
              data: {
                appointments: course.appointments,
                externalRegistration: course.externalRegistration,
                extraInfo: course.extraInfo,
                for: { set: course.for },
                maxParticipants: course.maxParticipants,
                minParticipants: course.minParticipants,
                moodleCourse: course.moodleCourse,
              },
              where: {
                phaseId_moduleCode: {
                  moduleCode: course.moduleCode,
                  phaseId: input.id,
                },
              },
            }),
          ),
          prisma.enrollphase.update({
            data: {
              description: input.description,
              end: input.end,
              start: input.start,
              title: input.title,
            },
            where: { id: input.id },
          }),
        ])
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
