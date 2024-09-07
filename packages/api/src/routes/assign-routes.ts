import { differenceBy, sortBy } from 'lodash-es'

import { prisma } from '../prisma/prisma'
import { router, studentOnlyProcedure } from './trpc'

export const assignRouter = router({
  list: studentOnlyProcedure.query(async ({ ctx }) => {
    const studentPhase = await prisma.studentPhase.findMany({
      orderBy: {
        phaseId: 'asc',
      },
      select: {
        Phase: {
          select: {
            description: true,
            emailNotificationAt: true,
            end: true,
            id: true,
            publishedTry: true,
            start: true,
            state: true,
            title: true,
          },
        },
        PhaseAssignments: {
          select: {
            moduleCode: true,
            tryNo: true,
          },
        },
        phaseId: true,
        StudentChoice: {
          select: {
            moduleCode: true,
            points: true,
          },
        },
      },
      where: {
        username: ctx.user.username,
      },
    })

    return studentPhase
      .filter((e) => e.Phase.publishedTry)
      .map((phase) => {
        const assignments = phase.PhaseAssignments.filter(
          (e) => e.tryNo === phase.Phase.publishedTry,
        ).map((assignment) => {
          return {
            moduleCode: assignment.moduleCode,
            points:
              phase.StudentChoice.find(
                (e) => e.moduleCode === assignment.moduleCode,
              )?.points ?? 0,
          }
        })
        return {
          assignments: sortBy(assignments, 'points'),
          lost: sortBy(
            differenceBy(phase.StudentChoice, assignments, (e) => e.moduleCode),
            'points',
          ),
          Phase: phase.Phase,
          phaseId: phase.phaseId,
        }
      })
  }),
})
