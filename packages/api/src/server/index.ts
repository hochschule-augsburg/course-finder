import { fastifyCookie } from '@fastify/cookie'
import { fastifySession } from '@fastify/session'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import fastify from 'fastify'

import { appRouter } from '../router'
import { createContext } from '../router/context'

export interface ServerOptions {
  dev?: boolean
  port?: number
  prefix?: string
}

declare module 'fastify' {
  interface Session {
    id?: number
    user_id: string
  }
}

export async function createServer(opts: ServerOptions) {
  const dev = opts.dev ?? true
  const port = opts.port ?? 3000
  const prefix = opts.prefix ?? '/api'
  const server = fastify({ logger: dev })

  await server.register(fastifyCookie)
  await server.register(fastifySession, {
    secret: 'TODO Secret 32 characters long ssssssssssssssssssssssss',
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
