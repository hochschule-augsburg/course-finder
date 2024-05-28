<script lang="ts" setup>
import type { onAfterStepOptions } from 'v-onboarding'

import { useLocalStorage } from '@vueuse/core'
import { VOnboardingWrapper, useVOnboarding } from 'v-onboarding'
import 'v-onboarding/dist/style.css'
import { onMounted, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VApp, VMain } from 'vuetify/components'

import { ModalDialog } from './components/DialogService'
import { useUserStore } from './stores/UserStore'

useUserStore()

const { t } = useI18n()
const onboardingStep = useLocalStorage('onboardingStep', 0)
const onboardingWrapper = ref(null)
const { goToStep } = useVOnboarding(onboardingWrapper)

const steps = [
  {
    attachTo: {
      element: 'i',
    },
    content: {
      description: t('tour.description'),
      title: t('tour.welcome'),
    },
    on: {
      afterStep: (options?: onAfterStepOptions) => {
        onboardingStep.value = options ? options.index + 1 : 0
      },
    },
  },
]

provide('startOnboarding', () => goToStep(0))

onMounted(() => {
  if (onboardingStep.value === steps.length) {
    return
  }
  goToStep(onboardingStep.value)
})
</script>

<template>
  <VApp>
    <VOnboardingWrapper :steps ref="onboardingWrapper" />
    <CustomNavbar />
    <VMain class="my-4 mx-2">
      <ModalDialog />
      <RouterView />
    </VMain>
    <CustomFooter />
  </VApp>
</template>
