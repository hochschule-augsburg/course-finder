<script lang="ts" setup>
import type { onAfterStepOptions } from 'v-onboarding'

import { useLocalStorage } from '@vueuse/core'
import {
  VOnboardingStep,
  VOnboardingWrapper,
  useVOnboarding,
} from 'v-onboarding'
import 'v-onboarding/dist/style.css'
import { onMounted, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VApp,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCardTitle,
  VMain,
  VSpacer,
} from 'vuetify/components'

import { ModalDialog } from './components/DialogService'
import { useCoursesStore } from './stores/CoursesStore'
import { useEnrollmentStore } from './stores/EnrollmentStore'
import { useUserStore } from './stores/UserStore'

useUserStore()

const { t } = useI18n()
const onboardingStep = useLocalStorage('onboardingStep', 0)
const onboardingWrapper = ref(null)
const { goToStep } = useVOnboarding(onboardingWrapper)

const coursesStore = useCoursesStore()
const enrollmentStore = useEnrollmentStore()

function afterStep(options?: onAfterStepOptions) {
  onboardingStep.value = options ? options.index + 1 : 0
}

async function selectSubject() {
  await enrollmentStore.addSubject(coursesStore.filteredSubjects[0].moduleCode)
}

const steps = ref(
  [
    '#enrollment-overview',
    '#filter-section',
    '#subject-view-toggle',
    '.subject-element',
    '.enroll-checkbox',
    '#enroll-button',
    '#nav-bar',
  ].map((selector) => ({
    attachTo: {
      element: selector,
    },
    content: {
      description: t('tour.desc.' + selector.slice(1)),
      title: t('tour.title.' + selector.slice(1)),
    },
    on: {
      afterStep,
      beforeStep: selector === '#enroll-button' ? selectSubject : () => {},
    },
  })),
)

provide('startOnboarding', () => goToStep(0))

onMounted(() => {
  if (onboardingStep.value === steps.value.length) {
    return
  }
  goToStep(onboardingStep.value)
})
</script>

<template>
  <VApp>
    <VOnboardingWrapper :steps ref="onboardingWrapper">
      <template #default="{ previous, next, step, isFirst, isLast }">
        <VOnboardingStep>
          <VCard v-if="step.content" max-width="300">
            <VCardTitle v-if="step.content.title">
              {{ step.content.title }}
            </VCardTitle>

            <VCardText v-if="step.content.description">
              <p>{{ step.content.description }}</p>
            </VCardText>

            <VCardActions>
              <VBtn
                v-if="!isFirst"
                :text="t('tour.prev')"
                variant="plain"
                @click="previous"
              />
              <VSpacer />
              <VBtn
                :text="isLast ? t('tour.finish') : t('tour.next')"
                color="primary"
                variant="tonal"
                @click="next"
              />
            </VCardActions>
          </VCard>
        </VOnboardingStep>
      </template>
    </VOnboardingWrapper>
    <CustomNavbar />
    <VMain class="my-4 mx-2">
      <ModalDialog />
      <RouterView />
    </VMain>
    <CustomFooter />
  </VApp>
</template>
