/* eslint-disable @typescript-eslint/no-explicit-any */

import LoginDialog from '@/components/LoginDialog.vue'
import { useUserStore } from '@/stores/UserStore'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import { VBtn, VTextField } from 'vuetify/components'

import { i18nForTests } from '../test-utils/i18nForTests'

vi.mock('@/stores/UserStore')

describe('LoginDialog.vue', () => {
  it('emits success event on successful login', async () => {
    //@ts-ignore
    vi.mocked(useUserStore).mockReturnValue({
      login: () => ({}) as any,
    })
    const wrapper = mountComponent()

    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('sets error value on failed login', async () => {
    //@ts-ignore
    vi.mocked(useUserStore).mockReturnValue({
      login: () => Promise.reject(new Error('bla')),
    })
    const wrapper = mountComponent()

    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(
      wrapper
        .findAllComponents(VTextField)
        .find((e) => e.props('label') === 'Password')
        ?.props('errorMessages'),
    ).toBe('global.unknown-error')
  })

  it('should do twoFA', async () => {
    const username = 'testuser'
    const password = 'testpassword'
    const otp = '123456'
    let allowLogin = false

    const loginMock = vi.fn(() => {
      if (allowLogin) {
        return {} as any
      }
      return Promise.resolve('two-fa-required' as const)
    })
    //@ts-ignore
    vi.mocked(useUserStore).mockReturnValue({
      login: loginMock,
    })
    const wrapper = mountComponent()

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

    expect(loginMock).toHaveBeenCalledWith(username, password)

    allowLogin = true

    wrapper
      .findAllComponents(VTextField)
      .find((e) => e.props('label') === 'Two-factor code')
      ?.vm.$emit('update:modelValue', otp)
    await flushPromises()
    wrapper.findComponent(VBtn).vm.$emit('click')
    await flushPromises()

    expect(loginMock).toHaveBeenCalledWith(username, password, otp)
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('sets error value on failed twoFALogin', async () => {
    const errorText = 'code-expired'
    let loginReturn: Promise<typeof errorText> = Promise.resolve(errorText)
    const loginMock = vi.fn(() => loginReturn)
    //@ts-ignore
    vi.mocked(useUserStore).mockReturnValue({
      login: loginMock,
    })
    const wrapper = mountComponent({ shallow: true })

    // @ts-ignore
    await wrapper.vm.twoFALogin()

    // @ts-ignore
    expect(wrapper.vm.error).toBe(`error.two-fa.${errorText}`)

    loginReturn = Promise.reject()

    // @ts-ignore
    await wrapper.vm.twoFALogin()

    // @ts-ignore
    expect(wrapper.vm.error).toBe('global.unknown-error')
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
