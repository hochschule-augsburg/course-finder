import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export interface User {
  name: string
}

export function createContext({ req, res }: CreateFastifyContextOptions) {
  if (req.session.user) {
    return { req, res, user: req.session.user }
  }
  return { req, res }
}

export type Context = Awaited<ReturnType<typeof createContext>>
