<script setup lang="ts">
import { type Subject, useCoursesStore } from '@/stores/CoursesStore'
import { MAX_POINTS, useEnrollmentStore } from '@/stores/EnrollmentStore'
import { sumBy } from 'lodash-es'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VDialog,
  VForm,
  VRow,
  VSheet,
  VSpacer,
  VTextField,
} from 'vuetify/components'

const { locale } = useI18n()
const { t } = useI18n()

const enrollmentStore = useEnrollmentStore()
const coursesStore = useCoursesStore()

const visible = defineModel<boolean>('visible')

const form = ref<VForm | undefined>(undefined)
const loading = ref<boolean>(false)
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)

const creditsNeeded = ref<number>(0)

function openSubjectDialog(moduleCode: string) {
  selectedSubject.value = coursesStore.subjects.find(
    (s) => s.moduleCode === moduleCode,
  )
  showSubjectDialog.value = true
}

function back() {
  visible.value = false
}

const pointInputRules = [
  (i: string) => !!i || t('field-required'),
  (i: string) => /^[1-9]\d*$/.test(i) || t('integer-input'), // check is input is valid int > 0
]

async function validate() {
  const formValidation = await form.value?.validate()

  if (!formValidation?.valid) {
    return
  }

  if (
    enrollmentStore.enrolledSubjects.length > 0 && // make it possible to reset enrollment
    sumBy(enrollmentStore.enrolledSubjects, 'points') !== MAX_POINTS
  ) {
    form.value?.items
      .slice(1)
      .forEach((i) => i.errorMessages.push(t('points-sum-1000')))
    return
  }

  loading.value = true

  try {
    await enrollmentStore.enroll(creditsNeeded.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }

  visible.value = false
}

function reset() {
  form.value?.reset()
}
</script>

<template>
  <VDialog v-model:model-value="visible" max-width="500">
    <SubjectDialog
      v-model:visible="showSubjectDialog"
      :subject="selectedSubject"
    />
    <VSheet
      class="pa-5"
      color="rgb(var(--v-theme-secondary))"
      max-width="var(--dialog-max-width)"
      rounded="lg"
    >
      <div class="d-flex align-start formHead">
        <VBtn
          :text="t('global.back')"
          prepend-icon="mdi-arrow-left"
          variant="plain"
          @click="back"
        />
      </div>
      <VForm ref="form">
        <VTextField
          v-model.number="creditsNeeded"
          :label="t('credits-wanted')"
          required
        />
        <VTextField
          v-for="subject in enrollmentStore.enrolledSubjects"
          v-model.number="subject.points"
          :key="subject.moduleCode"
          :label="locale === 'de' ? subject.title.de : subject.title.en"
          :rules="pointInputRules"
          append-icon="mdi-delete"
          append-inner-icon="mdi-book-information-variant"
          required
          @click:append="enrollmentStore.removeSubject(subject.moduleCode)"
          @click:append-inner="openSubjectDialog(subject.moduleCode)"
        />

        <VRow align="center" class="mt-2 px-3">
          <VBtn icon="mdi-restore" size="small" @click="reset" />
          <VSpacer />
          <VBtn :loading="loading" :text="t('register')" @click="validate" />
        </VRow>
      </VForm>
    </VSheet>
  </VDialog>
</template>

<style scoped lang="scss">
.container {
  height: 100%;
}
.formHead {
  width: 90%;
  max-width: var(--dialog-max-width);
}
</style>

<i18n lang="yaml">
de:
  register: Anmelden
  field-required: Dies ist ein Pflichtfeld!
  integer-input: Bitte eine ganze Zahl eingeben!
  credits-wanted: Bestrebte Credit Points
  points-sum-1000: Insgesamt 1000 Punkte vergeben!
en:
  register: Register
  field-required: This field is required!
  integer-input: This field must be an integer!
  credits-wanted: Credits wanted
  points-sum-1000: allocate 1000 points in total!
</i18n>
