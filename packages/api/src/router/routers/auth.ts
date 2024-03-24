import { scg } from 'ioc-service-container'
import { z } from 'zod'

import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string(), username: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user) {
        return { message: 'Already logged in' }
      }
      const ldapService = scg('LdapService')
      return {
        success: await ldapService.authenticate(input.username, input.password),
      }
    }),
  version: publicProcedure.query(() => {
    return { version: '0.42.0' }
  }),
})
