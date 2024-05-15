<script setup lang="ts">
import { type Subject } from '@/stores/CoursesStore'
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

const visible = defineModel<boolean>('visible')

const form = ref<VForm | undefined>(undefined)
const loading = ref<boolean>(false)
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)
const creditsNeeded = ref<number>(0)

const autoFillOptions = {
  fallback: { icon: 'mdi-alpha-f-circle' },
  prio: { icon: 'mdi-alpha-p-circle' },
}

function getNextAutoFillOption(currentOption?: 'fallback' | 'prio') {
  return currentOption === 'fallback' ? 'prio' : 'fallback'
}

async function autoFill() {
  await form.value?.validate()

  if (enrollmentStore.enrolledSubjects.some((s) => !s.autoFillOption)) {
    form.value?.items.slice(1).forEach((item, index) => {
      if (!enrollmentStore.enrolledSubjects[index].autoFillOption) {
        item.errorMessages.push(t('select-autofill'))
      }
    })
    return
  }

  let remPoints = MAX_POINTS

  const fallbackSubjects = enrollmentStore.enrolledSubjects.filter(
    (s) => s.autoFillOption === 'fallback',
  )
  const prioSubjects = enrollmentStore.enrolledSubjects.filter(
    (s) => s.autoFillOption === 'prio',
  )

  fallbackSubjects.forEach((s) => {
    if (remPoints > 0) {
      s.points = 1
      remPoints--
    }
  })

  const prioPoints = Math.floor(remPoints / prioSubjects.length)
  prioSubjects.forEach((s) => {
    s.points = prioPoints
    remPoints -= prioPoints
  })

  prioSubjects.forEach((s) => {
    if (remPoints > 0) {
      s.points++
      remPoints--
    }
  })
}

const integerInputRules = [
  (i: string) => /^[0-9]\d*$/.test(i) || t('integer-input'), // check is input is valid int >= 0
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
      .forEach((i) => i.errorMessages.push(t('points-sum-100')))
    return
  }

  loading.value = true

  try {
    await enrollmentStore.enroll(creditsNeeded.value)
    // enrollmentStore.enrolledSubjects.forEach(
    //   (s) => (s.autoFillOption = 'undefined'),
    // )
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
  <VDialog v-model:model-value="visible" max-width="500" persistent>
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
      <VForm ref="form">
        <VTextField
          v-model.number="creditsNeeded"
          :label="t('credits-wanted')"
          :rules="integerInputRules"
          color="rgb(var(--v-theme-primary))"
          required
        />
        <VDivider :thickness="2" class="mt-0 mb-4" />
        <VTextField
          v-for="subject in enrollmentStore.enrolledSubjects"
          v-model.number="subject.points"
          :key="subject.moduleCode"
          :label="locale === 'de' ? subject.title.de : subject.title.en"
          :rules="integerInputRules"
          color="rgb(var(--v-theme-primary))"
          required
        >
          <template #append-inner>
            <VIcon
              @click.prevent="
                subject.autoFillOption = getNextAutoFillOption(
                  subject.autoFillOption,
                )
              "
            >
              {{ autoFillOptions[subject.autoFillOption].icon }}
            </VIcon>
          </template>
        </VTextField>
        <VRow align="center" class="mt-2 mb-1 px-3">
          <VBtn size="x-small" icon @click="reset">
            <VIcon>mdi-restore</VIcon>
            <VTooltip activator="parent" location="bottom" open-delay="500">
              {{ t('reset') }}
            </VTooltip>
          </VBtn>
          <VSpacer />
          <VBtn :text="t('autofill')" class="mr-3" @click="autoFill" />
          <VBtn :loading="loading" :text="t('register')" @click="validate" />
        </VRow>
      </VForm>
    </VSheet>
  </VDialog>
</template>

<i18n lang="yaml">
de:
  register: Anmelden
  field-required: Dies ist ein Pflichtfeld!
  integer-input: Bitte eine ganze Zahl eingeben!
  credits-wanted: Bestrebte Credit Points
  points-sum-100: Insgesamt 100 Punkte vergeben!
  select-autofill: Autofill Option ungültig
  reset: Zurücksetzen
  autofill: Autofill
en:
  register: Register
  field-required: This field is required!
  integer-input: This field must be an integer!
  credits-wanted: Credits wanted
  points-sum-100: allocate 100 points in total!
  select-autofill: Invalid autofill option
  reset: Reset
  autofill: Autofill
</i18n>
