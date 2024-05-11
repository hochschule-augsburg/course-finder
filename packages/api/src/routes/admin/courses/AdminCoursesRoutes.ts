import { z } from 'zod'

import { i18nInput, nullString } from '../../../prisma/PrismaZod'
import { prisma } from '../../../prisma/prisma'
import { courseFields } from '../../course/CourseRoutes'
import { adminProcedure, router } from '../../trpc'

const courseSpec = z.object({
  creditPoints: z.number().int(),
  editorUsername: nullString,
  extraInfo: nullString,
  facultyName: z.string(),
  infoUrl: nullString,
  lecturers: z.array(z.string()).optional(),
  moduleCode: z.string(),
  published: z.boolean().optional(),
  semesterHours: z.number().int(),
  title: i18nInput,
  varyingCP: z.unknown().optional(),
})

export const coursesRoutes = router({
  create: adminProcedure
    .input(z.array(courseSpec))
    .mutation(async ({ input }) => {
      return await prisma.course.createMany({
        data: input,
      })
    }),
  delete: adminProcedure
    .input(z.object({ moduleCodes: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      return await prisma.course.deleteMany({
        where: {
          moduleCode: { in: input.moduleCodes },
        },
      })
    }),
  list: adminProcedure.query(async () => {
    return await prisma.course.findMany({
      orderBy: {
        moduleCode: 'asc',
      },
      select: courseFields,
    })
  }),
  update: adminProcedure.input(courseSpec).mutation(async ({ input }) => {
    return await prisma.course.update({
      data: input,
      select: courseFields,
      where: { moduleCode: input.moduleCode },
    })
  }),
})
