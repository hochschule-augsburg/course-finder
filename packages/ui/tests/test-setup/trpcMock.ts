import type { trpc as trpcType } from '@/api/trpc'
import type { DeepMockProxy } from 'vitest-mock-extended'

import { mockDeep, mockReset } from 'vitest-mock-extended'

vi.doMock('@/api/trpc', () => ({
  __esModule: true,
  trpc: mockDeep<typeof trpcType>(),
}))

// otherwise ReferenceError: Cannot access '__vi_import_1__' before initialization
// https://github.com/vitest-dev/vitest/issues/1084#issuecomment-1086828732
// eslint-disable-next-line import/first
import { trpc } from '@/api/trpc'

export const trpcMock = trpc as DeepMockProxy<typeof trpc>

beforeEach(() => {
  mockReset(trpcMock)
})
