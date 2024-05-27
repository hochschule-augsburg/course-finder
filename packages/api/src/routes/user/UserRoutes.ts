import { TRPCError } from '@trpc/server'
import { randomBytes } from 'crypto'
import { TOTP } from 'totp-generator'
import { z } from 'zod'

import type { ClientUserExtended } from '../../prisma/PrismaTypes'

import { sendEmail } from '../../domain/mail/Mail'
import { authenticate } from '../../domain/user/UserService'
import { prisma } from '../../prisma/prisma'
import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  getUser: publicProcedure.query(async ({ ctx }) => {
    await ctx.req.session.save()
    return ctx.req.session.user
  }),
  // rate limited by reverse proxy
  login: publicProcedure
    .input(z.object({ password: z.string(), username: z.string() }))
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<
        | 'already-logged-in'
        | 'invalid-credentials'
        | 'service-not-available'
        | 'two-fa-required'
        | ClientUserExtended
      > => {
        if (ctx.user) {
          return 'already-logged-in'
        }

        const result = await authenticate(input.username, input.password)
        if (!result.success) {
          return result.cause
        }

        if (result.twoFA) {
          const { expires, otp } = TOTP.generate(generateBase32Key(), {
            period: 240,
          })
          ctx.req.session.twoFA = { expires, otp, username: input.username }
          await Promise.all([
            ctx.req.session.save(),
            await sendEmail(
              result.user.email,
              'Your two-factor authentication code',
              otp,
            ),
          ])
          return 'two-fa-required'
        }
        ctx.req.session.user = result.user
        ctx.req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7 // 1 week
        await ctx.req.session.save()
        return result.user
      },
    ),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.req.session.destroy()
  }),
  // rate limited by reverse proxy
  twoFA: publicProcedure
    .input(z.object({ otp: z.string(), username: z.string() }))
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<
        'code-expired' | 'code-invalid' | ClientUserExtended | undefined
      > => {
        if (ctx.req.session.twoFA?.username !== input.username) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No twoFA session',
          })
        }
        if (new Date().getTime() > ctx.req.session.twoFA.expires) {
          return 'code-expired'
        }
        if (input.otp !== ctx.req.session.twoFA.otp) {
          return 'code-invalid'
        }
        const user = await prisma.user.findUnique({
          include: { Student: true },
          where: { username: input.username },
        })
        ctx.req.session.twoFA = undefined
        const clientUser = user
          ? { ...user, auth: { twoFA: user.auth.twoFA } }
          : undefined
        ctx.req.session.user = clientUser
        await ctx.req.session.save()
        return clientUser
      },
    ),
})

function generateBase32Key() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXY234567' // Base32 charset

  return Array.from(randomBytes(20))
    .map((byte): string => charset.charAt(byte % charset.length))
    .join('')
}
