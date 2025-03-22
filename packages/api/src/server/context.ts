import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export type Context = Awaited<ReturnType<typeof createContext>>

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  try {
    if (req.cookies['cf-token']) {
      await req.jwtVerify()
    }
  } catch {
    return { req, res }
  }
  return { req, res, user: req.user }
}
