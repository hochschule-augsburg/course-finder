import { TRPCError } from '@trpc/server'
import { groupBy, sortBy } from 'lodash-es'
import { z } from 'zod'

import {
  emailToLists,
  emailToStudents,
} from '../../../domain/assign/AssignMails.ts'
import { assign } from '../../../domain/assign/AssignmentAlgorithm.ts'
import { buildYamlResults } from '../../../domain/assign/ResultsYaml.ts'
import { PhaseService } from '../../../domain/phase/PhaseService.ts'
import { prisma } from '../../../prisma/prisma.ts'
import { adminProcedure, router } from '../../trpc.ts'

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
      let { tryNo } = (await prisma.phaseAssignment.findFirst({
        orderBy: { tryNo: 'desc' },
        select: { tryNo: true },
        where: { phaseId: currentPhase.id },
      })) ?? { tryNo: -1 }

      tryNo++

      await prisma.phaseAssignment.createMany({
        data: Object.entries(results).flatMap(([student, moduleCodes]) =>
          moduleCodes.map((moduleCode) => ({
            moduleCode,
            phaseId: currentPhase.id,
            tryNo,
            username: student,
          })),
        ),
      })

      const courses: Record<string, { count: number }> = {}

      Object.entries(results).forEach(([_student, moduleCodes]) => {
        moduleCodes.forEach((moduleCode) => {
          if (!courses[moduleCode]) {
            courses[moduleCode] = { count: 0 }
          }
          courses[moduleCode].count++
        })
      })

      return {
        result: sortBy(
          Object.entries(courses).map(([moduleCode, { count }]) => ({
            assignCount: count,
            moduleCode,
          })),
          'moduleCode',
        ),
        tryNo,
      }
    }),
  list: adminProcedure
    .input(z.object({ phaseId: z.number() }))
    .query(
      async ({
        input,
      }): Promise<
        { assignCount: number; moduleCode: string; tryNo: number }[][]
      > => {
        const assignments = await prisma.phaseAssignment.groupBy({
          _count: { moduleCode: true },
          by: ['tryNo', 'moduleCode'],
          orderBy: [{ tryNo: 'asc' }, { moduleCode: 'asc' }],
          where: { phaseId: input.phaseId },
        })

        return Object.values(
          groupBy(
            assignments.map((e) => ({
              assignCount: e._count.moduleCode,
              moduleCode: e.moduleCode,
              tryNo: e.tryNo,
            })),
            'tryNo',
          ),
        )
      },
    ),
  publish: adminProcedure
    .input(z.object({ phaseId: z.number(), tryNo: z.number() }))
    .mutation(async ({ input }) => {
      await Promise.all([
        PhaseService.updatePhase(input.phaseId, { state: 'FINISHED' }),
        prisma.enrollphase.update({
          data: {
            publishedTry: input.tryNo,
          },
          where: { id: input.phaseId },
        }),
      ])
      const results = await prisma.phaseAssignment.findMany({
        select: { moduleCode: true, username: true },
        where: { phaseId: input.phaseId, tryNo: input.tryNo },
      })

      const phase = (await prisma.enrollphase.findUnique({
        where: { id: input.phaseId },
      }))!
      await emailToLists(phase)
      await emailToStudents(phase, results)
    }),
  yaml: adminProcedure
    .input(z.object({ phaseId: z.number(), tryNo: z.number() }))
    .query(async ({ input }) => {
      const results = await prisma.phaseAssignment.findMany({
        select: { moduleCode: true, username: true },
        where: { phaseId: input.phaseId, tryNo: input.tryNo },
      })

      const phase = (await prisma.enrollphase.findUnique({
        where: { id: input.phaseId },
      }))!
      return await buildYamlResults(phase, results)
    }),
})
