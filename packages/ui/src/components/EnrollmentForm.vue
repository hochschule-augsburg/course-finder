<script setup lang="ts">
import type { EnrolledCourse } from '@/stores/EnrollmentStore'

import { type Subject, useCoursesStore } from '@/stores/CoursesStore'
import { MAX_POINTS, useEnrollmentStore } from '@/stores/EnrollmentStore'
import {
  mdiAlphaFCircle,
  mdiAlphaPCircle,
  mdiClose,
  mdiHelpCircle,
} from '@mdi/js'
import { cloneDeep, sumBy } from 'lodash-es'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VDialog,
  VDivider,
  VForm,
  VIcon,
  VRow,
  VSpacer,
  VTextField,
  VTooltip,
} from 'vuetify/components'

const { locale, t } = useI18n()
const { mobile } = useDisplay()

const coursesStore = useCoursesStore()
const enrollmentStore = useEnrollmentStore()

const visible = defineModel<boolean>('visible')

const form = ref<VForm | null>()
const formData = ref<EnrolledCourse[]>([])
const loading = ref<boolean>(false)
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)
const creditsNeeded = ref<number | undefined>(undefined)

const isFormUntouched = computed(
  () =>
    formData.value.filter(
      (e) =>
        e.points !==
        enrollmentStore.enrolledSubjects.find(
          (original) => original.moduleCode === e.moduleCode,
        )?.points,
    ).length === 0 && creditsNeeded.value === enrollmentStore.creditsNeeded,
)

watch(visible, () => {
  if (visible.value) {
    formData.value = cloneDeep(enrollmentStore.enrolledSubjects)
    creditsNeeded.value = enrollmentStore.creditsNeeded
  }
})

const autoFillOptions = {
  fallback: mdiAlphaFCircle,
  prio: mdiAlphaPCircle,
}

function getNextAutoFillOption(currentOption?: 'fallback' | 'prio') {
  return currentOption === 'fallback' ? 'prio' : 'fallback'
}

async function autoFill() {
  await form.value?.validate()

  if (formData.value.some((s) => !s.autoFillOption)) {
    form.value?.items.slice(1).forEach((item, index) => {
      if (!formData.value[index].autoFillOption) {
        item.errorMessages.push(t('select-autofill'))
      }
    })
    return
  }

  let remPoints = MAX_POINTS

  const fallbackSubjects = formData.value.filter(
    (s) => s.autoFillOption === 'fallback',
  )
  const prioSubjects = formData.value.filter((s) => s.autoFillOption === 'prio')

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
    formData.value.length > 0 && // make it possible to reset enrollment
    sumBy(formData.value, 'points') !== MAX_POINTS
  ) {
    form.value?.items
      .slice(1)
      .forEach((i) => i.errorMessages.push(t('points-sum-100')))
    return
  }

  loading.value = true

  try {
    await enrollmentStore.enroll(formData.value, creditsNeeded.value ?? 0)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }

  visible.value = false
  // Dialog prevents scrolling
  setTimeout(() => window.scrollTo(0, 0), 1)
  coursesStore.sortSubjects()
}
</script>

<template>
  <VDialog
    v-model:model-value="visible"
    :persistent="!isFormUntouched"
    id="enroll-form"
    max-width="500"
  >
    <SubjectDialog
      v-model:visible="showSubjectDialog"
      :subject="selectedSubject"
    />
    <VCard :subtitle="t('subtitle')" :title="t('title')">
      <template #append>
        <!-- TODO: update link -->
        <VBtn
          href="https://sirchnik.github.io/subject-enroll/student.html#anmeldung-der-wahlpflichtfacher"
          target="blank"
          variant="plain"
          icon
        >
          <VIcon :icon="mdiHelpCircle" />
          <VTooltip activator="parent" location="top right" offset="2">
            {{ t('global.help') }}
          </VTooltip>
        </VBtn>
        <VBtn variant="plain" icon @click="visible = false">
          <VIcon :icon="mdiClose" />
          <VTooltip activator="parent" location="top right" offset="2">
            {{ t('global.close') }}
          </VTooltip>
        </VBtn>
      </template>
      <VCardText class="pt-3 pb-0">
        <VForm ref="form">
          <VTextField
            v-model.number="creditsNeeded"
            :label="t('credits-wanted')"
            :rules="integerInputRules"
            class="mb-3"
            color="primary"
            required
          />
          <VDivider :thickness="2" class="mt-0 mb-6" />
          <template v-for="subject in formData" :key="subject.moduleCode">
            <VTextField
              v-model.number="subject.points"
              :label="locale === 'de' ? subject.title.de : subject.title.en"
              class="mb-3"
              color="primary"
              required
            >
              <template #append>
                <VBtn
                  density="compact"
                  tabindex="-1"
                  flat
                  icon
                  @click="
                    () => {
                      subject.autoFillOption = getNextAutoFillOption(
                        subject.autoFillOption,
                      )
                    }
                  "
                >
                  <VIcon :icon="autoFillOptions[subject.autoFillOption]" />
                  <VTooltip activator="parent" location="top right" offset="2">
                    {{ t(subject.autoFillOption) }}
                  </VTooltip>
                </VBtn>
              </template>
            </VTextField>
          </template>
          <VRow v-if="mobile" align="center" class="mb-6 px-3">
            <div
              v-for="(icon, option) in autoFillOptions"
              :key="option"
              class="pr-2"
            >
              <VIcon :icon size="small" />
              {{ t(option) }}
            </div>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions class="mb-1 mx-2">
        <VBtn :text="t('autofill')" variant="plain" @click="autoFill" />
        <VSpacer />
        <VBtn
          :loading="loading"
          :text="t('register')"
          color="primary"
          variant="tonal"
          @click="validate"
        />
      </VCardActions>
    </VCard>
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
  autofill: Autofill
  prio: Priorität
  fallback: Fallback
  title: Priorisierung
  subtitle: Automatische Priorisierung mit 'Autofill' möglich
en:
  register: Register
  field-required: This field is required!
  integer-input: This field must be an integer!
  credits-wanted: Credits wanted
  points-sum-100: allocate 100 points in total!
  select-autofill: Invalid autofill option
  autofill: Autofill
  prio: Priority
  fallback: Fallback
  title: Prioritization
  subtitle: Automatic prioritization possible with 'Autofill'
</i18n>
