import { TRPCError } from '@trpc/server'
import { randomBytes } from 'crypto'
import sendmail from 'sendmail'
import { TOTP } from 'totp-generator'
import { z } from 'zod'

import { UserExtended } from '../../libExports'
import { prisma } from '../../prisma'
import { publicProcedure, router } from '../../router/trpc'
import { authenticate } from './UserService'

export const authRouter = router({
  getUser: publicProcedure.query(async ({ ctx }) => {
    return ctx.req.session.user
  }),
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
        | UserExtended
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
            sendEmail(result.user.email, otp),
          ])
          return 'two-fa-required'
        }
        ctx.req.session.user = result.user
        await ctx.req.session.save()
        return result.user
      },
    ),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.req.session.destroy()
  }),
  twoFA: publicProcedure
    .input(z.object({ otp: z.string(), username: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
      const user: UserExtended | undefined =
        (await prisma.user.findUnique({
          include: { Faculty: true, Prof: true, Student: true },
          where: { username: input.username },
        })) ?? undefined
      ctx.req.session.twoFA = undefined
      ctx.req.session.user = user
      await ctx.req.session.save()
      return user
    }),
})

function generateBase32Key() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXY234567' // Base32 charset

  return Array.from(randomBytes(20))
    .map((byte): string => charset.charAt(byte % charset.length))
    .join('')
}

function sendEmail(to: string, text: string) {
  return new Promise((resolve) =>
    sendmail({
      smtpHost: 'smtp.hs-augsburg.de',
      smtpPort: 25,
    })(
      {
        from: 'subject-enroll@hs-augsburg.de',
        subject: 'Your two-factor authentication code',
        text,
        to,
      },
      resolve,
    ),
  )
}
