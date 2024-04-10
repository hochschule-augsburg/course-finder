import { z } from 'zod'

import { prisma } from '../../prisma'
import { router, studentProcedure } from '../../router/trpc'

export const courseRouter = router({
  getCourses: studentProcedure
    .input(
      z.object({
        semester: z.string(),
      }),
    )
    .query(async (opts) => {
      return await prisma.course.findMany({
        include: {
          Faculty: true,
          offeredCourses: {
            where: {
              semester: { equals: opts.input.semester, mode: 'insensitive' },
            },
          },
        },
      })
    }),
})
