<script lang="ts" setup>
import { mdiClose } from '@mdi/js'
import {
  VOnboardingStep,
  VOnboardingWrapper,
  useVOnboarding,
} from 'v-onboarding'
import 'v-onboarding/dist/style.css'
import { computed, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VApp,
  VBtn,
  VCard,
  VCardActions,
  VMain,
  VSpacer,
} from 'vuetify/components'

import { ModalDialog } from './components/DialogService'
import { useCoursesStore } from './stores/CoursesStore'
import { useEnrollmentStore } from './stores/EnrollmentStore'
import { useUserStore } from './stores/UserStore'

useUserStore()

const { t } = useI18n()
const onboardingWrapper = ref<null | typeof VOnboardingWrapper>(null)
// eslint-disable-next-line @typescript-eslint/unbound-method
const { finish, start } = useVOnboarding(onboardingWrapper) // method doesn't need this context

const enrollmentStore = useEnrollmentStore()
const coursesStore = useCoursesStore()

async function selectSubject() {
  await enrollmentStore.addSubject(coursesStore.filteredSubjects[0].moduleCode)
}

async function unselectSubject() {
  await enrollmentStore.removeSubject(
    coursesStore.filteredSubjects[0].moduleCode,
  )
}

const steps = computed(() =>
  [
    '#enrollment-overview',
    '#filter-section',
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
      afterStep: selector === '#enroll-button' ? unselectSubject : () => {},
      beforeStep: selector === '#enroll-button' ? selectSubject : () => {},
    },
  })),
)

provide('startOnboarding', () => start())
</script>

<template>
  <VApp>
    <VOnboardingWrapper :steps ref="onboardingWrapper">
      <template #default="{ previous, next, step, isFirst, isLast }">
        <VOnboardingStep>
          <VCard
            v-if="step.content"
            :text="step.content.description"
            :title="step.content.title"
            max-width="300"
          >
            <template #append>
              <VIcon :icon="mdiClose" @click="finish" />
            </template>

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
