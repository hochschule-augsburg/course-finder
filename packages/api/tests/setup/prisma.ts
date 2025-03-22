import type { PrismaClient } from '@prisma/client'
import type { DeepMockProxy } from 'vitest-mock-extended'

import { mockDeep, mockReset } from 'vitest-mock-extended'

import { prisma } from '../../src/prisma/prisma'

vi.mock('../../src/prisma/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock: DeepMockProxy<PrismaClient> =
  prisma as DeepMockProxy<PrismaClient>
