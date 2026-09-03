import { z } from 'zod'

import { prisma } from '../prisma/prisma.ts'
import { adminProcedure, publicProcedure, router } from './trpc.ts'

export const appConfRoutes = router({
  read: publicProcedure.query(async () => {
    return await prisma.appConf.findFirst({
      select: {
        hasMinFocuses: true,
        mailReceivers: true,
        maxCredits: true,
        moduleBookLastUpdated: true,
      },
    })
  }),
  update: adminProcedure
    .input(
      z
        .object({
          mailReceivers: z.array(z.string().email()),
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
