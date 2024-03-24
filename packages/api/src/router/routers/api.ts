import { z } from 'zod'

import { publicProcedure, router } from '../trpc'

export const apiRouter = router({
  hello: publicProcedure
    .input(z.object({ username: z.string().nullish() }).nullish())
    .query(({ ctx, input }) => {
      return {
        text: `hello ${input?.username ?? ctx.user?.name ?? 'world'}`,
      }
    }),
  version: publicProcedure.query(() => {
    return { version: '0.42.0' }
  }),
})
