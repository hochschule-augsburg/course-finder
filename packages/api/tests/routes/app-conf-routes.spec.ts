import '../setup/env.ts'

import type { FastifyReply, FastifyRequest } from 'fastify'

import { appConfRoutes } from '../../src/routes/app-conf-routes.ts'
import { prismaMock } from '../setup/prisma.ts'

describe('appConfRoutes', () => {
  it('should read appConf with mailReceivers', async () => {
    prismaMock.appConf.findFirst.mockResolvedValue({
      hasMinFocuses: false,
      id: 'Instance',
      mailReceivers: ['admin@example.com', 'team@example.com'],
      maxCredits: 30,
      moduleBookLastUpdated: new Date(),
    })

    const caller = appConfRoutes.createCaller({
      req: {} as FastifyRequest,
      res: {} as FastifyReply,
      user: undefined,
    })

    const result = await caller.read()
    expect(result).toBeDefined()
    expect(result?.mailReceivers).toEqual([
      'admin@example.com',
      'team@example.com',
    ])
    expect(result?.maxCredits).toBe(30)
  })

  it('should update appConf with mailReceivers as admin', async () => {
    prismaMock.appConf.updateMany.mockResolvedValue({ count: 1 })

    const caller = appConfRoutes.createCaller({
      req: {} as FastifyRequest,
      res: {} as FastifyReply,
      user: {
        auth: {},
        email: 'admin@example.com',
        lastActive: new Date(),
        name: 'Admin',
        type: 'Admin',
        username: 'admin',
      },
    })

    await caller.update({
      mailReceivers: ['info@hs-augsburg.de'],
      maxCredits: 25,
    })

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaMock.appConf.updateMany).toHaveBeenCalledWith({
      data: {
        mailReceivers: ['info@hs-augsburg.de'],
        maxCredits: 25,
      },
    })
  })
})
