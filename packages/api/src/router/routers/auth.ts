import { Client } from 'ldapts'
import { z } from 'zod'

import { publicProcedure, router } from '../trpc'

export const authRouter = router({
  login: publicProcedure
    .input(z.object({ password: z.string(), username: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user) {
        return { message: 'Already logged in' }
      }
      const client = new Client({
        connectTimeout: 5000,
        strictDN: true,
        timeout: 0,
        tlsOptions: {
          minVersion: 'TLSv1.2',
        },
        url: 'ldaps://ldap1.hs-augsburg.de:636',
      })

      await client.bind(
        'uid=sirchnik,ou=People,dc=FH-Augsburg,dc=de',
        input.password,
      )

      const _userData = (
        await client.search(
          `uid=${input.username},ou=People,dc=FH-Augsburg,dc=de`,
        )
      ).searchEntries[0]
      ctx.req.session.user_id = input.username
      await client.unbind()
    }),
  version: publicProcedure.query(() => {
    return { version: '0.42.0' }
  }),
})
