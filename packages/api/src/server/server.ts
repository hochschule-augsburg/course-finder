import { fastifyCookie } from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import { fastifySession } from '@fastify/session'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

import type { ClientUserExtended } from '../prisma/PrismaTypes'

import { appRouter } from '../routes/router'
import { createContext } from './context'

declare module 'fastify' {
  interface Session {
    twoFA?: { expires: number; otp: string; username: string }
    user?: ClientUserExtended
  }
}

export async function createServer() {
  if (!process.env.SERVER_HOSTNAME || !process.env.SERVER_PORT) {
    throw new Error('envs SERVER_PREFIX and SERVER_HOSTNAME are required')
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('env SESSION_SECRET is required and needs 32 characters')
  }

  const server = fastify({ logger: true })

  await server.register(fastifyCookie)
  await server.register(fastifySession, {
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    },
    secret: process.env.SESSION_SECRET,
  })
  await server.register(fastifyCors, {
    credentials: true,
    origin: (origin, cb) => {
      if (
        origin === undefined ||
        new URL(origin).hostname === process.env.FRONTEND_HOSTNAME
      ) {
        cb(null, true)
      } else {
        // Generate an error on other origins, disabling access
        cb(new Error('Not allowed'), false)
      }
    },
  })

  void server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: { createContext, router: appRouter },
  })

  async function stop() {
    await server.close()
  }
  async function start() {
    try {
      await server.listen({
        // relevant for docker
        host: process.env.SERVER_HOSTNAME,
        port: Number(process.env.SERVER_PORT),
      })
      console.log('listening on port', process.env.SERVER_PORT)
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }

  return { server, start, stop }
}
