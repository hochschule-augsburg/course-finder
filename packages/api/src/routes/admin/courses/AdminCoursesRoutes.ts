import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { i18nInput, nullString } from '../../../prisma/PrismaZod'
import { prisma } from '../../../prisma/prisma'
import { courseFields } from '../../course/CourseRoutes'
import { adminProcedure, router } from '../../trpc'

const courseSpec = z.object({
  creditPoints: z.number().int(),
  editorUsername: nullString,
  extraInfo: nullString,
  facultyName: nullString,
  infoUrl: nullString,
  lecturers: z.array(z.string()).optional(),
  moduleCode: z.string(),
  published: z.boolean().optional(),
  semesterHours: z.number().int(),
  title: i18nInput,
  varyingCP: z.unknown().optional(),
})

export const coursesRoutes = router({
  create: adminProcedure.input(courseSpec).mutation(async ({ input }) => {
    if (!input.moduleCode) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
      })
    }
    return await prisma.course.create({
      data: {
        ...input,
        title: {
          de: input.title.de ?? input.title.en,
          en: input.title.en ?? input.title.de,
        },
      },
      select: courseFields,
    })
  }),
  delete: adminProcedure
    .input(z.object({ moduleCode: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.course.delete({
        where: {
          moduleCode: input.moduleCode,
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
      data: {
        ...input,
        title: {
          de: input.title.de ?? input.title.en,
          en: input.title.en ?? input.title.de,
        },
      },
      select: courseFields,
      where: { moduleCode: input.moduleCode },
    })
  }),
})
