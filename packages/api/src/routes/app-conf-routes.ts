import { z } from 'zod'

import { prisma } from '../prisma/prisma'
import { adminProcedure, router, studentProcedure } from './trpc'

export const appConfRoutes = router({
  read: studentProcedure.query(async () => {
    return await prisma.appConf.findFirst({
      select: {
        maxCredits: true,
      },
    })
  }),
  update: adminProcedure
    .input(
      z
        .object({
          maxCredits: z.number().int().positive(),
        })
        .partial(),
    )
    .mutation(async ({ input }) => {
      await prisma.appConf.updateMany({
        data: input,
      })
    }),
})
