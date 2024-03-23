import { apiRouter } from './routers/api'
import { authRouter } from './routers/auth'
import { postsRouter } from './routers/posts'
import { router } from './trpc'

export const appRouter = router({
  api: apiRouter,
  auth: authRouter,
  posts: postsRouter,
})

export type AppRouter = typeof appRouter
