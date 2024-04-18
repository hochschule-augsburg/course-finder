import { fastifyCookie } from '@fastify/cookie'
import { fastifyCors } from '@fastify/cors'
import { fastifySession } from '@fastify/session'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

import type { ServerOptions } from '../../../config'
import type { UserExtended } from '../prisma/PrismaTypes'

import { appRouter } from '../routes/router'
import { createContext } from './context'

declare module 'fastify' {
  interface Session {
    twoFA?: { expires: number; otp: string; username: string }
    user?: UserExtended
  }
}

export async function createServer(opts: ServerOptions) {
  const port = opts.port ?? 3000
  const prefix = opts.prefix
  const server = fastify({ logger: true })

  await server.register(fastifyCookie)
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('env SESSION_SECRET is required and needs 32 characters')
  }
  await server.register(fastifySession, {
    secret: process.env.SESSION_SECRET,
  })
  await server.register(fastifyCors, {
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
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
    prefix,
    trpcOptions: { createContext, router: appRouter },
  })

  async function stop() {
    await server.close()
  }
  async function start() {
    try {
      await server.listen({ port })
      console.log('listening on port', port)
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }

  return { server, start, stop }
}
