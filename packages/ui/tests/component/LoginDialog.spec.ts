import type { ClientUserExtended } from '@api/prisma/PrismaTypes'

import LoginDialog from '@/components/LoginDialog.vue'
import { useUserStore } from '@/stores/UserStore'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { VBtn, VTextField } from 'vuetify/components'

import { i18nForTests } from '../test-utils/i18nForTests'
import { mockedStore } from '../test-utils/piniaMock'

describe('LoginDialog.vue', () => {
  it('emits success event on successful login', async () => {
    const wrapper = mountComponent()
    const userStore = mockedStore(useUserStore)
    userStore.login.mockResolvedValueOnce({} as ClientUserExtended)

    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('sets error value on failed login', async () => {
    const wrapper = mountComponent()
    const userStore = mockedStore(useUserStore)
    userStore.login.mockRejectedValue(new Error('bla'))

    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(
      wrapper
        .findAllComponents(VTextField)
        .find((e) => e.props('label') === 'Password')
        ?.props('errorMessages'),
    ).toBe('unknown-error')
  })

  it('should do twoFA', async () => {
    const username = 'testuser'
    const password = 'testpassword'
    const otp = '123456'

    const wrapper = mountComponent()
    const userStore = mockedStore(useUserStore)
    userStore.login.mockResolvedValueOnce('two-fa-required')

    wrapper
      .findAllComponents(VTextField)
      .find((e) => e.props('label') === 'Username')
      ?.vm.$emit('update:modelValue', username)
    wrapper
      .findAllComponents(VTextField)
      .find((e) => e.props('label') === 'Password')
      ?.vm.$emit('update:modelValue', password)
    await flushPromises()

    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(userStore.login).toHaveBeenCalledWith(username, password)

    userStore.login.mockResolvedValueOnce({} as ClientUserExtended)

    wrapper
      .findAllComponents(VTextField)
      .find((e) => e.props('label') === 'Two-factor code')
      ?.vm.$emit('update:modelValue', otp)
    await flushPromises()
    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(userStore.login).toHaveBeenCalledWith(username, password, otp)
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('sets error value on failed twoFALogin', async () => {
    const wrapper = mountComponent({ shallow: true })
    const userStore = mockedStore(useUserStore)
    userStore.login.mockRejectedValueOnce(new Error())

    // @ts-ignore
    await wrapper.vm.twoFALogin()

    // @ts-ignore
    expect(wrapper.vm.error).toBe('unknown-error')

    const error = 'code-expired'
    userStore.login.mockResolvedValueOnce(error)

    // @ts-ignore
    await wrapper.vm.twoFALogin()

    // @ts-ignore
    expect(wrapper.vm.error).toBe(`error.two-fa.${error}`)
  })
})

function mountComponent(opts: { shallow?: boolean } = {}) {
  return mount(LoginDialog, {
    global: {
      plugins: [createTestingPinia(), i18nForTests(), createVuetify()],
    },
    shallow: opts.shallow,
  })
}
