import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Mock } from 'vitest'

import type { Student, User } from '../../../src/generated/prisma/client.js'
import type { ClientUserExtended } from '../../../src/prisma/PrismaTypes.ts'

import { appRouter } from '../../../src/routes/router.ts'

export interface MockResponseRecorder {
  clearCookieMock: Mock
  clearedCookies: Record<string, unknown>
  cookies: Record<string, { options: unknown; value: string }>
  jwtSignMock: Mock
  res: FastifyReply
  setCookieMock: Mock
}

export function createMockFastifyReply(): MockResponseRecorder {
  const cookies: Record<string, { options: unknown; value: string }> = {}
  const clearedCookies: Record<string, unknown> = {}

  const clearCookieMock = vi.fn((name: string, options: unknown) => {
    clearedCookies[name] = options
    delete cookies[name]
    return res
  })

  const jwtSignMock = vi.fn((payload: unknown) => {
    return Promise.resolve(
      Buffer.from(JSON.stringify(payload)).toString('base64'),
    )
  })

  const setCookieMock = vi.fn(
    (name: string, value: string, options: unknown) => {
      cookies[name] = { options, value }
      return res
    },
  )

  const res = {
    clearCookie: clearCookieMock,
    jwtSign: jwtSignMock,
    setCookie: setCookieMock,
  } as unknown as FastifyReply

  return {
    clearCookieMock,
    clearedCookies,
    cookies,
    jwtSignMock,
    res,
    setCookieMock,
  }
}

export function createMockFastifyRequest(): FastifyRequest {
  return {
    cookies: {},
    log: {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
  } as unknown as FastifyRequest
}

export function createPublicCaller(replyRecorder?: MockResponseRecorder) {
  const req = createMockFastifyRequest()
  const res = replyRecorder ? replyRecorder.res : createMockFastifyReply().res
  return appRouter.createCaller({ req, res, user: undefined })
}

export function createStudentCaller(
  user: User & { Student: Student },
  replyRecorder?: MockResponseRecorder,
) {
  const req = createMockFastifyRequest()
  const res = replyRecorder ? replyRecorder.res : createMockFastifyReply().res

  const clientUser: ClientUserExtended = {
    auth: {
      twoFA: user.auth.twoFA === true,
    },
    email: user.email,
    lastActive: user.lastActive,
    name: user.name,
    otp: user.otp,
    Student: user.Student,
    type: 'Student',
    username: user.username,
  }

  return appRouter.createCaller({
    req,
    res,
    user: clientUser,
  })
}

export function createAdminCaller(replyRecorder?: MockResponseRecorder) {
  const req = createMockFastifyRequest()
  const res = replyRecorder ? replyRecorder.res : createMockFastifyReply().res
  const adminUser: ClientUserExtended = {
    auth: { twoFA: false },
    email: 'admin@hs-augsburg.de',
    lastActive: new Date(),
    name: 'Admin User',
    otp: null,
    type: 'Admin',
    username: 'admin',
  }

  return appRouter.createCaller({
    req,
    res,
    user: adminUser,
  })
}
