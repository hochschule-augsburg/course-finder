<script lang="ts" setup>
import { homeTour } from '@/stores/TourStore'
import 'v-onboarding/dist/style.css'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VApp, VMain } from 'vuetify/components'

import CustomOnboarding from './components/CustomOnboarding.vue'
import { ModalDialog } from './components/DialogService'
import { useCoursesStore } from './stores/CoursesStore'
import { useEnrollmentStore } from './stores/EnrollmentStore'

const { t } = useI18n()
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
</script>

<template>
  <VApp>
    <CustomOnboarding :name="homeTour" :steps />
    <CustomNavbar />
    <VMain class="my-4 mx-2">
      <ModalDialog />
      <RouterView />
    </VMain>
    <CustomFooter />
  </VApp>
</template>
