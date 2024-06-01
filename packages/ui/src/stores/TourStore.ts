import type { VOnboardingWrapper } from 'v-onboarding'
import type { Ref } from 'vue'

import { defineStore } from 'pinia'
import { useVOnboarding } from 'v-onboarding'
import { ref } from 'vue'

export const homeTour = Symbol('homeTour')

export type Tour = {
  [key: symbol]: { finish: () => void; start: () => void }
}

export const useTourStore = defineStore('tour', () => {
  const tours = ref<Tour>({})

  function registerTour(
    wrapper: Ref<null | typeof VOnboardingWrapper>,
    name: symbol,
  ) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { finish, start } = useVOnboarding(wrapper) // method doesn't need `this` context
    tours.value[name] = { finish, start }

    return { finish, start }
  }

  function startTour(name: symbol) {
    tours.value[name].start()
  }

  function finishTour(name: symbol) {
    tours.value[name].finish()
  }

  return { finishTour, registerTour, startTour }
})
