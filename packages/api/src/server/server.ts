import { fastifyCookie } from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import { fastifyJwt } from '@fastify/jwt'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

import type { ClientUserExtended } from '../prisma/PrismaTypes.ts'

import { env } from '../env.ts'
import { adminFastifyRoutes } from '../routes/admin/AdminFastifyRoutes.ts'
import { appRouter } from '../routes/router.ts'
import { createContext } from './context.ts'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: ClientUserExtended
  }
}

export async function createServer() {
  const server = fastify({ logger: true })

  await server.register(fastifyMultipart)
  await server.register(fastifyCookie)
  await server.register(fastifyJwt, {
    cookie: {
      cookieName: 'cf-token',
      signed: false,
    },
    secret: env.JWT_SECRET,
  })
  await server.register(fastifyCors, {
    credentials: true,
    origin: env.FRONTEND_ORIGIN,
  })

  await server.register(fastifyTRPCPlugin, {
    prefix: '/api/trpc',
    trpcOptions: { createContext, router: appRouter },
  })

  await server.register(adminFastifyRoutes)

  async function stop() {
    await server.close()
  }
  async function start() {
    try {
      await server.listen({
        // relevant for docker
        host: env.SERVER_HOSTNAME,
        port: env.SERVER_PORT,
      })
      console.log('listening on port', env.SERVER_PORT)
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }

  return { server, start, stop }
}
