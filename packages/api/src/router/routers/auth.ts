import { TRPCError } from '@trpc/server'
import { scg } from 'ioc-service-container'
import { z } from 'zod'

import { LoginError } from '../../domain/user/UserService'
import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string(), username: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user) {
        return { message: 'Already logged in', success: false }
      }
      const userService = scg('UserService')

      const result = await userService.authenticate(
        input.username,
        input.password,
      )
      if (!result.ok) {
        if (result.error === LoginError.InvalidCredentials) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid credentials',
          })
        }
        throw new TRPCError({
          code: 'BAD_REQUEST',
        })
      }
      return result.data
    }),
})
