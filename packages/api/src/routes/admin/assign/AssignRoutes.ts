import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { assign } from '../../../domain/assign/AssignmentAlgorithm'
import { prisma } from '../../../prisma/prisma'
import { adminProcedure, router } from '../../trpc'

export const assignRouter = router({
  assign: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .mutation(async ({ input }) => {
      const currentPhase = await prisma.enrollphase.findUnique({
        where: { id: input.phaseId },
      })
      if (!currentPhase) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid Phase' })
      }
      const results = await assign(currentPhase.id)
      const { tryNo } = (await prisma.phaseAssignment.findFirst({
        orderBy: { tryNo: 'desc' },
        select: { tryNo: true },
        where: { phaseId: currentPhase.id },
      })) ?? { tryNo: 0 }

      prisma.phaseAssignment.createMany({
        data: Object.entries(results).flatMap(([student, moduleCodes]) =>
          moduleCodes.map((moduleCode) => ({
            moduleCode,
            phaseId: currentPhase.id,
            tryNo,
            username: student,
          })),
        ),
      })

      const courses: Record<string, string[]> = {}

      Object.entries(results).forEach(([student, moduleCodes]) => {
        moduleCodes.forEach((moduleCode) => {
          if (!courses[moduleCode]) {
            courses[moduleCode] = []
          }
          courses[moduleCode].push(student)
        })
      })

      return courses
    }),
  list: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .query(async ({ input }) => {
      return await prisma.phaseAssignment.findMany({
        where: { phaseId: input.phaseId },
      })
    }),
})
