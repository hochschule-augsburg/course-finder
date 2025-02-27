import * as crypto from 'crypto'
import { z } from 'zod'

import { authenticate } from '../../domain/user/UserService.ts'
import { env } from '../../env.ts'
import { prisma } from '../../prisma/prisma.ts'
import { publicProcedure, router } from '../trpc.ts'

const domain = new URL(env.FRONTEND_ORIGIN).hostname

export const authRouter = router({
  getUser: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return undefined
    }
    void (async () => {
      await prisma.user.update({
        data: {
          lastActive: new Date(),
        },
        where: { username: ctx.user?.username },
      })
    })()

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
        | { token: string }
      > => {
        const result = await authenticate(input.username, input.password)
        if (!result.success) {
          return result.cause
        }

        const ctxToken = crypto.randomBytes(32).toString('hex')

        const token = await ctx.res.jwtSign({
          ctxHash: crypto.createHash('sha256').update(ctxToken).digest('hex'),
          user: result.user,
        })
        ctx.res.setCookie('cf-token', ctxToken, {
          domain,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
          // todo prefix
          httpOnly: true,
          path: '/',
          sameSite: true,
          secure: !env.DEV,
        })
        return { token: token }
      },
    ),
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('cf-token', {
      domain,
      httpOnly: true,
      path: '/',
      sameSite: true,
      secure: !env.DEV,
    })
  }),
})
