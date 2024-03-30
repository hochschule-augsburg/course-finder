import { apiRouter } from './routers/api'
import { authRouter } from './routers/auth'
import { router } from './trpc'

export const appRouter = router({
  api: apiRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
