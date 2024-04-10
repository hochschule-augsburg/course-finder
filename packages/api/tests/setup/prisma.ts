import type { PrismaClient } from '@prisma/client'
import type { DeepMockProxy } from 'vitest-mock-extended'

import { mockDeep, mockReset } from 'vitest-mock-extended'

import { prisma } from '../../src/prisma'

vi.mock('../../src/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as DeepMockProxy<PrismaClient>
