import '../setup/env.ts'

import type { FastifyReply, FastifyRequest } from 'fastify'

import { appConfRoutes } from '../../src/routes/app-conf-routes.ts'
import { prismaMock } from '../setup/prisma.ts'

describe('appConfRoutes', () => {
  it('should not expose allowedEnrollmentEmails and mailReceivers to non-admin users', async () => {
    prismaMock.appConf.findFirst.mockResolvedValue({
      allowedEnrollmentEmails: [],
      hasMinFocuses: false,
      id: 'Instance',
      mailReceivers: [],
      maxCredits: 30,
      moduleBookLastUpdated: new Date(),
    })

    const caller = appConfRoutes.createCaller({
      req: {} as FastifyRequest,
      res: {} as FastifyReply,
      user: undefined,
    })

    await caller.read()

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaMock.appConf.findFirst).toHaveBeenCalledWith({
      select: {
        allowedEnrollmentEmails: false,
        hasMinFocuses: true,
        mailReceivers: false,
        maxCredits: true,
        moduleBookLastUpdated: true,
      },
    })
  })

  it('should read appConf with mailReceivers and allowedEnrollmentEmails for admin users', async () => {
    prismaMock.appConf.findFirst.mockResolvedValue({
      allowedEnrollmentEmails: ['student@example.com'],
      hasMinFocuses: false,
      id: 'Instance',
      mailReceivers: ['admin@example.com', 'team@example.com'],
      maxCredits: 30,
      moduleBookLastUpdated: new Date(),
    })

    const caller = appConfRoutes.createCaller({
      req: {} as FastifyRequest,
      res: {} as FastifyReply,
      user: {
        auth: {},
        email: 'admin@example.com',
        lastActive: new Date(),
        name: 'Admin',
        otp: null,
        type: 'Admin',
        username: 'admin',
      },
    })

    const result = await caller.read()
    expect(result).toBeDefined()
    expect(result?.allowedEnrollmentEmails).toEqual(['student@example.com'])
    expect(result?.mailReceivers).toEqual([
      'admin@example.com',
      'team@example.com',
    ])
    expect(result?.maxCredits).toBe(30)

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaMock.appConf.findFirst).toHaveBeenCalledWith({
      select: {
        allowedEnrollmentEmails: true,
        hasMinFocuses: true,
        mailReceivers: true,
        maxCredits: true,
        moduleBookLastUpdated: true,
      },
    })
  })

  it('should update appConf with mailReceivers and allowedEnrollmentEmails as admin', async () => {
    prismaMock.appConf.updateMany.mockResolvedValue({ count: 1 })

    const caller = appConfRoutes.createCaller({
      req: {} as FastifyRequest,
      res: {} as FastifyReply,
      user: {
        auth: {},
        email: 'admin@example.com',
        lastActive: new Date(),
        name: 'Admin',
        otp: null,
        type: 'Admin',
        username: 'admin',
      },
    })

    await caller.update({
      allowedEnrollmentEmails: ['exception@example.com'],
      mailReceivers: ['info@hs-augsburg.de'],
      maxCredits: 25,
    })

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaMock.appConf.updateMany).toHaveBeenCalledWith({
      data: {
        allowedEnrollmentEmails: ['exception@example.com'],
        mailReceivers: ['info@hs-augsburg.de'],
        maxCredits: 25,
      },
    })
  })
})
