import { TRPCError } from '@trpc/server'
import { randomBytes } from 'crypto'
import { TOTP } from 'totp-generator'
import { z } from 'zod'

import type { ClientUserExtended } from '../../prisma/PrismaTypes'

import { sendEmail } from '../../domain/mail/Mail'
import { authenticate } from '../../domain/user/UserService'
import { env } from '../../env'
import { prisma } from '../../prisma/prisma'
import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  getUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return undefined
    }
    prisma.user
      .update({
        data: {
          lastActive: new Date(),
        },
        where: { username: ctx.user?.username },
      })
      .then(() => {})

    return ctx.user
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
          const otp = TOTP.generate(generateBase32Key(), {
            period: 120,
          })
          await Promise.all([
            prisma.user.update({
              data: {
                otp,
              },
              where: { username: input.username },
            }),
            await sendEmail(
              result.user.email,
              'Your two-factor authentication code',
              `Your code is ${otp.otp}. It will expire in 2 minutes.`,
            ),
          ])
          return 'two-fa-required'
        }

        const token = await ctx.res.jwtSign(result.user)
        ctx.res.setCookie('cf-token', token, {
          domain: env.FRONTEND_HOSTNAME,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
          httpOnly: true,
          path: '/',
          sameSite: true,
          secure: process.env.NODE_ENV === 'production',
        })
        return result.user
      },
    ),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('cf-token', {
      domain: env.FRONTEND_HOSTNAME,
      httpOnly: true,
      path: '/',
      sameSite: true,
      secure: process.env.NODE_ENV === 'production',
    })
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
        const user =
          (await prisma.user.findUnique({
            include: { Student: true },
            where: { username: input.username },
          })) ?? undefined

        if (!user?.otp) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No twoFA session',
          })
        }
        if (new Date().getTime() > user.otp.expires) {
          return 'code-expired'
        }
        if (input.otp !== user.otp.otp) {
          return 'code-invalid'
        }
        const clientUser: ClientUserExtended = {
          ...user,
          auth: { twoFA: user.auth.twoFA },
        }
        const token = await ctx.res.jwtSign(clientUser)
        ctx.res.setCookie('cf-token', token, {
          domain: env.SERVER_HOSTNAME,
          httpOnly: true,
          path: '/',
          sameSite: true,
          secure: process.env.NODE_ENV === 'production',
        })
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
