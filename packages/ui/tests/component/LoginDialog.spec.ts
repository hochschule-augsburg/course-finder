/* eslint-disable @typescript-eslint/no-unsafe-return */
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
})

function mountComponent(opts: { shallow?: boolean } = {}) {
  return mount(LoginDialog, {
    global: {
      plugins: [createTestingPinia(), i18nForTests(), createVuetify()],
    },
    shallow: opts.shallow,
  })
}
