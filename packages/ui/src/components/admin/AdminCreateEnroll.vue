<script setup lang="ts">
import { trpc } from '@/api/trpc'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { isWithinInterval } from 'date-fns'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
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

const { locale, t } = useI18n()
const adminCoursesStore = useAdminCoursesStore()

const oldPhasesSelect = computed(() =>
  adminCoursesStore.phases
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

const formData = ref({
  description: { de: '', en: '' }, // [I18n]
  end: new Date().toISOString(),
  start: new Date().toISOString(),
  title: { de: '', en: '' }, // [I18n]
})

async function createEnrollment() {
  try {
    await trpc.admin.enroll.phase.create.mutate({
      description: {
        de: formData.value.description.de,
        en: formData.value.description.en,
      },
      end: new Date(formData.value.end),
      offeredCourses: sharedObject.value.map((e) => ({
        ...e,
        moduleCode: e.Course.moduleCode,
      })),
      start: new Date(formData.value.start),
      title: { de: formData.value.title.de, en: formData.value.title.en },
    })
    console.log('Success creating enroll phase')
  } catch (e) {
    console.log('Error creating enroll phase')
  }
  sharedObject.value = []
}
</script>

<template>
  <VForm>
    <VContainer>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <h1>{{ t('create-enrollment') }}</h1>
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.start"
            :label="t('start-date')"
            type="datetime-local"
            required
          />
        </VCol>
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.end"
            :label="t('end-date')"
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
            :text="t('create-enrollment')"
            justify="center"
            @click="createEnrollment"
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
  start-date: Start date
  end-date: End date
  title-en: Title (en)
  title-de: Title (de)
  description-en: Description (en)
  description-de: Description (de)
  offered-courses: Offered Courses
  load-old-phases: Load Passed Enroll Phases
  clear: Clear Selection
de:
  create-enrollment: Anmeldung erstellen
  start-date: Startdatum
  end-date: Enddatum
  title-en: Titel (en)
  title-de: Titel (de)
  description-en: Beschreibung (en)
  description-de: Beschreibung (de)
  offered-courses: Angebotene Kurse
  load-old-phases: Vergangene Anmeldephasen laden
  clear: Auswahl löschen
</i18n>
