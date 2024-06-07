import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  try {
    await req.jwtVerify()
  } catch {
    return { req, res }
  }
  return { req, res, user: req.user }
}

export type Context = Awaited<ReturnType<typeof createContext>>
