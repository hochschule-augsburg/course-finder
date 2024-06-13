<script setup lang="ts">
import type { Phase } from '@/stores/admin/AdminCoursesStore'

import { getLocalISOString } from '@/helper/LocaleDateFormat'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { trpc } from '@/trpc'
import { isWithinInterval } from 'date-fns'
import { cloneDeep } from 'lodash-es'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  VBtn,
  VCol,
  VContainer,
  VForm,
  VRow,
  VSelect,
  VTextField,
  VTextarea,
} from 'vuetify/components'

import type { OfferedCourseData } from './types'

const props = defineProps<{ phaseId?: number }>()

const { locale, t } = useI18n()
const adminCoursesStore = useAdminCoursesStore()
const router = useRouter()
const showErrorDialog = ref(false)
const errorDialogMessage = ref('')

const formData = ref<
  {
    emailNotificationAt: string
    end: string
    id?: number
    start: string
  } & Omit<
    Phase,
    'emailNotificationAt' | 'end' | 'id' | 'publishedTry' | 'start' | 'state'
  >
>()

void initFormData()

const oldPhasesSelect = computed(() =>
  Object.values(adminCoursesStore.phases)
    .filter(
      (e) =>
        !isWithinInterval(new Date(), {
          end: e.end,
          start: e.start,
        }),
    )
    .map((phase) => ({
      text: locale.value === 'de' ? phase.title.de : phase.title.en,
      value: phase.id,
    })),
)

const loadedOldPhase = ref<string>()

async function loadOldPhase(phaseId: string) {
  const phase = await trpc.admin.enroll.phase.get.query({
    phaseId: Number(phaseId),
  })
  sharedObject.value = phase.offeredCourses
  loadedOldPhase.value = phaseId
}

function clearSelection() {
  sharedObject.value = []
  loadedOldPhase.value = undefined
}

const sharedObject = ref<OfferedCourseData[]>([])

async function submit() {
  if (props.phaseId) {
    await updateEnrollment()
  } else {
    await createEnrollment()
  }
}

async function updateEnrollment() {
  if (!formData.value || !props.phaseId) {
    return
  }
  try {
    await trpc.admin.enroll.phase.update.mutate({
      description: {
        de: formData.value.description.de,
        en: formData.value.description.en,
      },
      emailNotificationAt: formData.value.emailNotificationAt
        ? new Date(formData.value.emailNotificationAt)
        : undefined,
      end: new Date(formData.value.end),
      id: props.phaseId,
      offeredCourses: sharedObject.value,
      start: new Date(formData.value.start),
      title: { de: formData.value.title.de, en: formData.value.title.en },
    })
    Object.assign(adminCoursesStore.phases[props.phaseId], {
      description: {
        de: formData.value.description.de,
        en: formData.value.description.en,
      },
      emailNotificationAt: formData.value.emailNotificationAt
        ? new Date(formData.value.emailNotificationAt)
        : new Date(0), // todo: this should be set to whatever the db defaults to
      end: new Date(formData.value.end),
      id: props.phaseId,
      start: new Date(formData.value.start),
      title: { de: formData.value.title.de, en: formData.value.title.en },
    })
    adminCoursesStore.phaseOfferedCourses[props.phaseId] = sharedObject.value
    // console.log('Success updating enroll phase')
    router.back()
  } catch (e) {
    errorDialogMessage.value = t(
      'validation.backend-enroll-phase-updating-error',
    )
    showErrorDialog.value = true
  }
  sharedObject.value = []
}

async function createEnrollment() {
  if (!formData.value) {
    return
  }
  try {
    const newPhase = await trpc.admin.enroll.phase.create.mutate({
      description: {
        de: formData.value.description.de,
        en: formData.value.description.en,
      },
      emailNotificationAt: formData.value.emailNotificationAt
        ? new Date(formData.value.emailNotificationAt)
        : undefined,
      end: new Date(formData.value.end),
      offeredCourses: sharedObject.value,
      start: new Date(formData.value.start),
      title: { de: formData.value.title.de, en: formData.value.title.en },
    })
    adminCoursesStore.phases[newPhase.id] = {
      description: {
        de: formData.value.description.de,
        en: formData.value.description.en,
      },
      emailNotificationAt: formData.value.emailNotificationAt
        ? new Date(formData.value.emailNotificationAt)
        : new Date(0), // todo: this should be set to whatever the db defaults to
      end: new Date(formData.value.end),
      id: 0,
      publishedTry: null,
      start: new Date(formData.value.start),
      state: 'NOT_STARTED',
      title: { de: formData.value.title.de, en: formData.value.title.en },
    }
    adminCoursesStore.phaseOfferedCourses[newPhase.id] = sharedObject.value
    // console.log('Success creating enroll phase')
    router.back()
  } catch (e) {
    errorDialogMessage.value = t(
      'validation.backend-enroll-phase-creation-error',
    )
    showErrorDialog.value = true
  }
  sharedObject.value = []
}

async function initFormData() {
  if (props.phaseId) {
    await adminCoursesStore.fetchOfferedCourses(props.phaseId)
    const phase = adminCoursesStore.phases[props.phaseId]
    if (!phase) {
      return
    }
    sharedObject.value = cloneDeep(
      adminCoursesStore.phaseOfferedCourses[props.phaseId],
    )
    formData.value = {
      ...cloneDeep(phase),
      emailNotificationAt: getLocalISOString(phase.emailNotificationAt),
      end: getLocalISOString(phase.end),
      start: getLocalISOString(phase.start),
    }

    return
  }
  formData.value = {
    description: { de: '', en: '' },
    emailNotificationAt: getLocalISOString(new Date()),
    end: getLocalISOString(new Date()),
    start: getLocalISOString(new Date()),
    title: { de: '', en: '' },
  }
}

function validate(): boolean {
  // Startdate, Enddate, EN Title, DE Title required
  if (
    !formData.value?.start ||
    !formData.value?.end ||
    !formData.value?.title.en ||
    !formData.value?.title.de
  ) {
    return true
    // Startdate <= Enddate
  } else if (new Date(formData.value?.start) > new Date(formData.value?.end)) {
    return true
    // Wenn Emailnotification existier, Startdate <= Emailnotificationdate <= Enddate
  } else if (
    formData.value?.emailNotificationAt &&
    (new Date(formData.value?.start) >
      new Date(formData.value?.emailNotificationAt) ||
      new Date(formData.value?.end) <
        new Date(formData.value?.emailNotificationAt))
  ) {
    return true
  }
  return false
}

const requiredFieldRule = [
  (i: string | undefined) => !!i || t('validation.field-required'),
]
</script>

<template>
  <VForm>
    <VContainer v-if="formData">
      <VRow>
        <VCol cols="12" sm="5">
          <h1>{{ t(phaseId ? 'edit-enrollment' : 'create-enrollment') }}</h1>
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow dense>
        <VCol cols="12" md="4" sm="6">
          <VTextField
            v-model="formData.start"
            :label="t('start-date')"
            :rules="requiredFieldRule"
            hide-details="auto"
            type="datetime-local"
            validate-on="input"
            required
          />
          <small
            v-if="new Date(formData.start) > new Date(formData.end)"
            class="text-caption"
            style="color: rgb(var(--v-theme-primary))"
          >
            {{ t('validation.invalid-date-interval') }}
          </small>
        </VCol>
        <VCol cols="12" md="4" sm="6">
          <VTextField
            v-model="formData.end"
            :label="t('end-date')"
            :rules="requiredFieldRule"
            hide-details="auto"
            type="datetime-local"
            validate-on="input"
            required
          />
        </VCol>
        <VCol cols="12" md="4">
          <VTextField
            v-model="formData.emailNotificationAt"
            :label="t('sent-email-notification-at')"
            type="datetime-local"
            hide-details
          />
          <small
            v-if="
              new Date(formData.start) >
                new Date(formData.emailNotificationAt) ||
              new Date(formData.end) < new Date(formData.emailNotificationAt)
            "
            class="text-caption"
            style="color: rgb(var(--v-theme-primary))"
          >
            {{ t('validation.email-date-out-of-bounds') }}
          </small>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" sm="6">
          <VTextField
            v-model="formData.title.en"
            :label="t('title-en')"
            :rules="requiredFieldRule"
            hide-details="auto"
            validate-on="input"
            required
          />
        </VCol>
        <VCol cols="12" sm="6">
          <VTextField
            v-model="formData.title.de"
            :label="t('title-de')"
            :rules="requiredFieldRule"
            hide-details="auto"
            validate-on="input"
            required
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12">
          <VTextarea
            v-model="formData.description.en"
            :label="t('description-en')"
            hide-details
            required
          />
        </VCol>
        <VCol cols="12">
          <VTextarea
            v-model="formData.description.de"
            :label="t('description-de')"
            hide-details
            required
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" sm="7">
          <h1>{{ t('offered-courses') }}</h1>
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow>
        <VCol sm="8">
          <VSelect
            :items="oldPhasesSelect"
            :label="t('load-old-phases')"
            :model-value="loadedOldPhase"
            item-title="text"
            hide-details
            @update:model-value="loadOldPhase"
          />
        </VCol>
        <VCol sm="4">
          <VBtn :text="t('clear')" @click="clearSelection" />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12">
          <OfferedCourses
            v-if="adminCoursesStore.isInit"
            v-model="sharedObject"
          />
        </VCol>
      </VRow>
      <VRow>
        <VCol class="text-right">
          <VBtn
            :disabled="validate()"
            :text="t(phaseId ? 'global.save' : 'create-enrollment')"
            class="ms-auto"
            @click="submit"
          />
        </VCol>
      </VRow>
    </VContainer>
    <ErrorDialog
      :message="errorDialogMessage"
      :visible="showErrorDialog"
      @close="
        () => {
          showErrorDialog = false
          router.back()
        }
      "
    />
  </VForm>
</template>

<i18n lang="yaml">
en:
  create-enrollment: Create enrollment
  edit-enrollment: Edit enrollment phase
  start-date: Start date
  end-date: End date
  sent-email-notification-at: Sent email notification at
  title-en: Title (en)
  title-de: Title (de)
  description-en: Description (en)
  description-de: Description (de)
  offered-courses: Offered Courses
  load-old-phases: Load Passed Enroll Phases
  clear: Clear Selection
  validation:
    field-required: 'required field'
    invalid-date-interval: 'Startdate must come before enddate'
    email-date-out-of-bounds: 'E-mail date must be between start- and enddate'
    backend-enroll-phase-creation-error: 'Error when creating phase.'
    backend-enroll-phase-updating-error: 'Error when updating phase.'
de:
  create-enrollment: Anmeldung erstellen
  edit-enrollment: Anmeldephase bearbeiten
  start-date: Startdatum
  end-date: Enddatum
  sent-email-notification-at: E-Mail-Benachrichtigung senden am
  title-en: Titel (en)
  title-de: Titel (de)
  description-en: Beschreibung (en)
  description-de: Beschreibung (de)
  offered-courses: Angebotene Kurse
  load-old-phases: Vergangene Anmeldephasen laden
  clear: Auswahl löschen
  validation:
    field-required: 'Feld erforderlich'
    invalid-date-interval: 'Startdatum muss vor Enddatum kommen'
    email-date-out-of-bounds:
      'E-maildatum muss zwischen Startdatum und Enddatum liegen'
    backend-enroll-phase-creation-error: 'Fehler bei der Phasenerstellung.'
    backend-enroll-phase-updating-error: 'Fehler bei der Phasenaktualisierung.'
</i18n>
