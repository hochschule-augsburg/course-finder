import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { prisma } from '../../../prisma/prisma.ts'
import { i18nInput, nullString } from '../../../prisma/PrismaZod.ts'
import { courseFields } from '../../course/CourseRoutes.ts'
import { adminProcedure, router } from '../../trpc.ts'

const courseSpec = z.object({
  creditPoints: z.number().int(),
  editorUsername: nullString,
  extraInfo: nullString,
  faculty: z.string(),
  infoUrl: nullString,
  lecturers: z.array(z.string()).optional(),
  moduleCode: z.string(),
  published: z.boolean().optional(),
  semesterHours: z.number().int(),
  title: i18nInput,
  varyingCP: z.unknown().optional(),
})

export const coursesRoutes = router({
  create: adminProcedure.input(courseSpec).mutation(({ input }) => {
    if (!input.moduleCode) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
      })
    }
    return prisma.course.create({
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
    .mutation(({ input }) => {
      return prisma.course.delete({
        where: {
          moduleCode: input.moduleCode,
        },
      })
    }),
  list: adminProcedure.query(() => {
    return prisma.course.findMany({
      orderBy: {
        moduleCode: 'asc',
      },
      select: courseFields,
    })
  }),
  update: adminProcedure.input(courseSpec).mutation(({ input }) => {
    return prisma.course.update({
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
