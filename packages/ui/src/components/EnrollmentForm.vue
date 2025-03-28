<script setup lang="ts">
import type { EnrolledCourse } from '@/stores/EnrollmentStore'

import { useAppConfStore } from '@/stores/AppConfStore'
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
const appConfStore = useAppConfStore()

const visible = defineModel<boolean>('visible')

const form = ref<null | VForm>()
const formData = ref<EnrolledCourse[]>([])
const loading = ref<boolean>(false)
const showSubjectDialog = ref<boolean>(false)
const selectedSubject = ref<Subject | undefined>(undefined)
const creditsNeeded = ref<number | undefined>(undefined)

const formDisabled = computed(() => coursesStore.currentPhase?.state !== 'OPEN')

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

function getNextAutoFillOption(currentOption?: 'fallback' | 'prio') {
  return currentOption === 'fallback' ? 'prio' : 'fallback'
}

const integerInputRule = (i: string) =>
  /^[0-9]\d*$/.test(i) || t('integer-input')

function creditsRule(i: string) {
  if (Number(i) > (appConfStore.conf?.maxCredits ?? 0)) {
    return t('too-many-credits', { maxCredits: appConfStore.conf?.maxCredits })
  }
  if (Number(i) === 0) {
    return t('field-required')
  }
  return true
}

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
    id="enroll-form"
    v-model:model-value="visible"
    :persistent="!isFormUntouched"
    max-width="500"
  >
    <SubjectDialog
      v-model:visible="showSubjectDialog"
      :subject="selectedSubject"
    />
    <VCard :subtitle="t('subtitle')" :title="t('title')">
      <template #append>
        <VBtn
          href="https://hochschule-augsburg.github.io/course-finder/student#_3-2-wahlpflichtfach-anmeldung"
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
            :disabled="formDisabled"
            :label="t('credits-wanted')"
            :rules="[integerInputRule, creditsRule]"
            class="mb-3"
            color="primary"
            required
          />
          <VDivider :thickness="2" class="mt-0 mb-6" />
          <template v-for="subject in formData" :key="subject.moduleCode">
            <VTextField
              v-model.number="subject.points"
              :disabled="formDisabled"
              :label="subject.title[locale]"
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
        <VTooltip :disabled="!formDisabled" location="top">
          <template #activator="{ props: toolTipProps }">
            <div v-bind="toolTipProps">
              <VBtn
                :disabled="formDisabled"
                :loading="loading"
                :text="t('register')"
                color="primary"
                variant="tonal"
                @click="validate"
              />
            </div>
          </template>
          {{ t('no-regs-accepted') }}
        </VTooltip>
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
  too-many-credits:
    Zu viele Credit Points. Maximal erlaubt sind {maxCredits} Credit Points.
  no-regs-accepted: Keine Anmeldungen akzeptiert
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
  too-many-credits:
    Too many credit points. Maximum allowed are {maxCredits} credit points.
  no-regs-accepted: Keine Anmeldungen akzeptiert
</i18n>
