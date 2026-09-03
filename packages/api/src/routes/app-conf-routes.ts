import { z } from 'zod'

import { userHasPermission } from '../domain/user/UserRoles.ts'
import { prisma } from '../prisma/prisma.ts'
import { adminProcedure, publicProcedure, router } from './trpc.ts'

export const appConfRoutes = router({
  read: publicProcedure.query(async ({ ctx }) => {
    const isAdmin = userHasPermission(ctx.user, 'Admin')
    return await prisma.appConf.findFirst({
      select: {
        allowedEnrollmentEmails: isAdmin,
        hasMinFocuses: true,
        mailReceivers: isAdmin,
        maxCredits: true,
        moduleBookLastUpdated: true,
      },
    })
  }),
  update: adminProcedure
    .input(
      z
        .object({
          allowedEnrollmentEmails: z.array(z.string().email()),
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
