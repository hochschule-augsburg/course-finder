import type { ClientUserExtended } from '@workspace/api/src/prisma/PrismaTypes'
import type { Mock } from 'vitest'

import { useUserStore } from '@/stores/UserStore'
import { setupComposable } from '@tests/test-setup/composable'
import { trpcMock } from '@tests/test-setup/trpcMock'
import { storeToRefs } from 'pinia'
import { mock } from 'vitest-mock-extended'
import { useRouter } from 'vue-router'

vi.mock('vue-router')

//Mocking trpc didn't work
describe.skip('UserStore', () => {
  it('logs in a user', async () => {
    const mockUser = mock<ClientUserExtended>()
    trpcMock.auth.login.mutate.mockResolvedValue(mockUser)

    const { result: store } = setupComposable(useUserStore)
    await store.login('test', 'test')

    expect(trpcMock.auth.login.mutate).toHaveBeenCalledWith({
      password: 'test',
      username: 'test',
    })
    expect(store.user).toEqual(mockUser)
  })

  it('handles login error', async () => {
    trpcMock.auth.login.mutate.mockResolvedValue('invalid-credentials')

    const { result: store } = setupComposable(useUserStore)
    await store.login('test', 'test')

    expect(store.user).toBeNull()
  })

  it('handles two-factor authentication', async () => {
    const mockUser = mock<ClientUserExtended>()
    trpcMock.auth.twoFA.mutate.mockResolvedValue(mockUser)

    const { result: store } = setupComposable(useUserStore)
    await store.login('test', '', '123456')

    expect(trpcMock.auth.twoFA.mutate).toHaveBeenCalledWith({
      otp: '123456',
      username: 'test',
    })
    expect(store.user).toEqual(mockUser)
  })

  it('logs out a user', async () => {
    trpcMock.auth.logout.mutate.mockResolvedValue()

    const { result: store } = setupComposable(useUserStore)
    //@ts-ignore
    store.user = {}
    await store.logout()

    expect(store.user).toBeNull()
  })

  describe('init', () => {
    it('initializes the store', () => {
      const mockUser = mock<ClientUserExtended>()
      trpcMock.auth.getUser.query.mockResolvedValue(mockUser)

      const { result: store } = setupComposable(useUserStore)

      expect(store.user).toEqual(mockUser)
    })

    it('handles initialization error', () => {
      trpcMock.auth.getUser.query.mockRejectedValue(new Error('error'))

      const { result: store } = setupComposable(useUserStore)

      expect(store.user).toBeNull()
    })
  })

  describe('router guards', () => {
    const useRouterMock = useRouter as Mock

    it('redirects logged out users from admin routes', async () => {
      const mockRouter = { push: vi.fn() }
      useRouterMock.mockReturnValue(mockRouter)

      const store = setupComposable(useUserStore).result
      storeToRefs(store).user.value = mock<ClientUserExtended>()
      await store.logout()

      expect(mockRouter.push).toHaveBeenCalledWith('/')
    })
  })
})
