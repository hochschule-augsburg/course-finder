import type { VueWrapper } from '@vue/test-utils'

import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setupComposable<T extends () => any>(composable: T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { component: VueWrapper; result: ReturnType<T> } = {} as any
  result.component = mount(
    defineComponent({
      setup() {
        result.result = composable()
      },
    }),
    { global: { plugins: [createTestingPinia()] } },
  )
  return result
}
