import type { Enrollphase } from '@prisma/client'

import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { mayEnroll } from '../../domain/enroll/enrollUtils'
import { prisma } from '../../prisma/prisma'
import { router, studentOnlyProcedure } from '../trpc'

const pointsZodType = z.number().int().gte(0).lte(1000)
const creditsZodType = z.number().int().gte(0).lte(1000)

const enrollProcedure = studentOnlyProcedure
  .input(z.object({ phaseId: z.number() }))
  .use(async (opts) => {
    const phase = await prisma.enrollphase.findUnique({
      where: { id: opts.input.phaseId },
    })
    if (!phase) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'phase not in database',
      })
    }
    if (!mayEnroll(opts.ctx.user)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'student not eligible for enrollment',
      })
    }
    return opts.next({ ctx: { phase } })
  })

export const enrollRouter = router({
  bulk: enrollProcedure
    .input(
      z.object({
        creditsNeeded: creditsZodType,
        data: z.array(
          z.object({
            moduleCode: z.string(),
            points: pointsZodType,
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkIfPhaseIsOpen(ctx.phase)
      await checkCreditsNeeded(input.creditsNeeded)
      if (
        (
          await prisma.offeredCourse.findMany({
            where: {
              externalRegistration: false,
              for: { has: ctx.user.Student.fieldOfStudy },
              moduleCode: { in: input.data.map((e) => e.moduleCode) },
              phaseId: ctx.phase.id,
            },
          })
        ).length !== input.data.length
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'modules not offered for you',
        })
      }

      const data = {
        creditsNeeded: input.creditsNeeded,
        phaseId: ctx.phase.id,
        StudentChoice: {
          createMany: {
            data: input.data.map((e) => ({
              moduleCode: e.moduleCode,
              points: e.points,
            })),
          },
        },
        username: ctx.user.username,
      }
      await prisma.$transaction([
        prisma.studentChoice.deleteMany({
          where: { phaseId: ctx.phase.id, username: ctx.user.username },
        }),
        prisma.studentPhase.upsert({
          create: data,
          update: data,
          where: {
            username_phaseId: {
              phaseId: ctx.phase.id,
              username: ctx.user.username,
            },
          },
        }),
      ])

      return getStudentChoices(ctx.phase.id, ctx.user.username)
    }),
  delete: enrollProcedure
    .input(z.object({ moduleCode: z.string() }))
    .mutation(async ({ ctx, input }) => {
      checkIfPhaseIsOpen(ctx.phase)
      await prisma.studentChoice.delete({
        where: {
          moduleCode_username_phaseId: {
            moduleCode: input.moduleCode,
            phaseId: ctx.phase.id,
            username: ctx.user.username,
          },
        },
      })
    }),
  list: enrollProcedure
    .input(z.object({ phaseId: z.number() }))
    .query(({ ctx, input }) => {
      return getStudentChoices(input.phaseId, ctx.user.username)
    }),
  upsert: enrollProcedure
    .input(
      z.object({
        creditsNeeded: creditsZodType.optional(),
        moduleCode: z.string(),
        points: z.number().int().safe(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkIfPhaseIsOpen(ctx.phase)
      if (input.creditsNeeded) {
        await checkCreditsNeeded(input.creditsNeeded)
      }
      if (
        !(await prisma.offeredCourse.findUnique({
          where: {
            externalRegistration: false,
            for: { has: ctx.user.Student.fieldOfStudy },
            phaseId_moduleCode: {
              moduleCode: input.moduleCode,
              phaseId: ctx.phase.id,
            },
          },
        }))
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'module not offered for you',
        })
      }
      await prisma.studentPhase.upsert({
        create: {
          creditsNeeded: input.creditsNeeded ?? 0,
          phaseId: input.phaseId,
          StudentChoice: {
            create: {
              moduleCode: input.moduleCode,
              points: input.points,
            },
          },
          username: ctx.user.Student.username,
        },
        update: {
          creditsNeeded: input.creditsNeeded,
          StudentChoice: {
            upsert: {
              create: {
                moduleCode: input.moduleCode,
                points: input.points,
              },
              update: {
                points: input.points,
              },
              where: {
                moduleCode_username_phaseId: {
                  moduleCode: input.moduleCode,
                  phaseId: input.phaseId,
                  username: ctx.user.username,
                },
              },
            },
          },
        },
        where: {
          username_phaseId: {
            phaseId: input.phaseId,
            username: ctx.user.username,
          },
        },
      })
    }),
})

function checkIfPhaseIsOpen(phase: Enrollphase) {
  if (phase.state !== 'OPEN') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'phase not active',
    })
  }
}

async function checkCreditsNeeded(creditsNeeded: number) {
  const conf = (await prisma.appConf.findFirst())!
  if (creditsNeeded > conf.maxCredits) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'invalid credits needed',
    })
  }
}

async function getStudentChoices(phaseId: number, username: string) {
  const results = await prisma.studentPhase.findUnique({
    select: {
      creditsNeeded: true,
      StudentChoice: { select: { moduleCode: true, points: true } },
    },
    where: {
      username_phaseId: {
        phaseId,
        username,
      },
    },
  })
  return {
    choices: results?.StudentChoice ?? [],
    creditsNeeded: results?.creditsNeeded ?? 0,
  }
}
