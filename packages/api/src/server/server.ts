import { fastifyCookie } from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import { fastifyMultipart } from '@fastify/multipart'
import { fastifySession } from '@fastify/session'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

import type { ClientUserExtended } from '../prisma/PrismaTypes'

import env from '../env'
import { adminFastifyRoutes } from '../routes/admin/AdminFastifyRoutes'
import { appRouter } from '../routes/router'
import { createContext } from './context'

declare module 'fastify' {
  interface Session {
    twoFA?: { expires: number; otp: string; username: string }
    user?: ClientUserExtended
  }
}

export async function createServer() {
  if (env.SESSION_SECRET.length < 32) {
    throw new Error('env SESSION_SECRET is required and needs 32 characters')
  }

  const server = fastify({ logger: true })

  await server.register(fastifyMultipart)
  await server.register(fastifyCookie)
  await server.register(fastifySession, {
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
    secret: env.SESSION_SECRET,
  })
  await server.register(fastifyCors, {
    credentials: true,
    origin: (origin, cb) => {
      if (
        origin === undefined ||
        new URL(origin).hostname === env.FRONTEND_HOSTNAME
      ) {
        cb(null, true)
      } else {
        // Generate an error on other origins, disabling access
        cb(new Error('Not allowed'), false)
      }
    },
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
        port: Number(env.SERVER_PORT),
      })
      console.log('listening on port', env.SERVER_PORT)
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }

  return { server, start, stop }
}
