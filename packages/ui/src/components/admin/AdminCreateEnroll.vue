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

const formData = ref<
  {
    emailNotificationAt: string
    end: string
    id?: number
    start: string
  } & Omit<Phase, 'emailNotificationAt' | 'end' | 'id' | 'start' | 'state'>
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
  router.back()
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
      emailNotificationAt: new Date(formData.value.emailNotificationAt),
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
      emailNotificationAt: new Date(formData.value.emailNotificationAt),
      end: new Date(formData.value.end),
      id: props.phaseId,
      start: new Date(formData.value.start),
      title: { de: formData.value.title.de, en: formData.value.title.en },
    })
    adminCoursesStore.phaseOfferedCourses[props.phaseId] = sharedObject.value
    console.log('Success updating enroll phase')
  } catch (e) {
    console.log('Error updating enroll phase')
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
      emailNotificationAt: new Date(formData.value.emailNotificationAt),
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
      emailNotificationAt: new Date(formData.value.emailNotificationAt),
      end: new Date(formData.value.end),
      id: 0,
      start: new Date(formData.value.start),
      state: 'NOT_STARTED',
      title: { de: formData.value.title.de, en: formData.value.title.en },
    }
    adminCoursesStore.phaseOfferedCourses[newPhase.id] = sharedObject.value
    console.log('Success creating enroll phase')
  } catch (e) {
    console.log('Error creating enroll phase')
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
</script>

<template>
  <VForm>
    <VContainer v-if="formData">
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <h1>{{ t(phaseId ? 'edit-enrollment' : 'create-enrollment') }}</h1>
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="3">
          <VTextField
            v-model="formData.start"
            :label="t('start-date')"
            type="datetime-local"
            required
          />
        </VCol>
        <VCol cols="12" sm="3">
          <VTextField
            v-model="formData.end"
            :label="t('end-date')"
            type="datetime-local"
            required
          />
        </VCol>
        <VCol cols="12" sm="3">
          <VTextField
            v-model="formData.emailNotificationAt"
            :label="t('sent-email-notification-at')"
            type="datetime-local"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.title.en"
            :label="t('title-en')"
            required
          />
        </VCol>
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.title.de"
            :label="t('title-de')"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="10">
          <VTextarea
            v-model="formData.description.en"
            :label="t('description-en')"
            required
          />
        </VCol>
        <VCol cols="12" sm="10">
          <VTextarea
            v-model="formData.description.de"
            :label="t('description-de')"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <h1>{{ t('offered-courses') }}</h1>
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol sm="7">
          <VSelect
            :items="oldPhasesSelect"
            :label="t('load-old-phases')"
            :model-value="loadedOldPhase"
            item-title="text"
            @update:model-value="loadOldPhase"
          />
        </VCol>
        <VCol sm="3">
          <VBtn :text="t('clear')" @click="clearSelection" />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="10">
          <OfferedCourses
            v-if="adminCoursesStore.isInit"
            v-model="sharedObject"
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VBtn
            :text="t(phaseId ? 'global.save' : 'create-enrollment')"
            justify="center"
            @click="submit"
          />
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
    </VContainer>
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
</i18n>
