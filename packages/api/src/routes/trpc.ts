import type { Student } from '@prisma/client'

import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

import type { ClientUser } from '../prisma/PrismaTypes'
import type { Context } from '../server/context'

import { userHasPermission } from '../domain/user/UserRoles'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  },
  isDev: process.env.NODE_ENV === 'development',
  transformer: superjson,
})

t.middleware(async ({ ctx, next, path, type }) => {
  const result = await next()

  ctx.req.log.info({ path, result, type, user: ctx.user })

  return result
})

export const router = t.router
export const publicProcedure = t.procedure

export const studentOnlyProcedure = t.procedure.use(
  async function isAuthed(opts) {
    const { ctx } = opts
    if (ctx.user?.type === 'Student') {
      return opts.next({
        ctx: {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          user: ctx.user as { Student: Student } & ClientUser,
        },
      })
    }
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  },
)
export const studentProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts
  if (!userHasPermission(ctx.user, 'Student')) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  })
})
export const profProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts
  if (!userHasPermission(ctx.user, 'Professor')) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  })
})
export const adminProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts
  if (!userHasPermission(ctx.user, 'Admin')) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({
    ctx: {
      user: ctx.user,
    },
  })
})
