import { z } from 'zod'

import { i18nInput } from '../../../prisma/PrismaZod'
import { prisma } from '../../../prisma/prisma'
import { courseFields } from '../../course/CourseRoutes'
import { adminProcedure, router } from '../../trpc'

const nullString = z
  .string()
  .transform((v) => (v.trim() ? v.trim() : undefined))
  .optional()

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
  list: adminProcedure
    .input(z.object({ moduleCodes: z.array(z.string()) }))
    .query(async ({ input }) => {
      return await prisma.course.findMany({
        select: courseFields,
        where: {
          moduleCode: {
            in: input.moduleCodes,
          },
        },
      })
    }),
  update: adminProcedure.input(courseSpec).mutation(async ({ input }) => {
    return await prisma.course.update({
      data: input,
      where: { moduleCode: input.moduleCode },
    })
  }),
})
