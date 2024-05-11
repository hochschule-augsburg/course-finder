<script setup lang="ts">
import { trpc } from '@/api/trpc'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { isWithinInterval } from 'date-fns'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VCol, VSelect } from 'vuetify/components'

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

async function loadOldCourses(phaseId: string | undefined) {
  if (!phaseId) {
    sharedObject.value = []
  }
  const phase = await trpc.admin.enroll.phase.get.query({
    phaseId: Number(phaseId),
  })
  sharedObject.value = phase.offeredCourses
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
        <VCol cols="12" sm="5"><h1>Create enrollment</h1></VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.start"
            label="Start date"
            type="datetime-local"
            required
          />
        </VCol>
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.end"
            label="End date"
            type="datetime-local"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VTextField v-model="formData.title.en" label="Title (en)" required />
        </VCol>
        <VCol cols="12" sm="5">
          <VTextField v-model="formData.title.de" label="Title (de)" required />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="10">
          <VTextarea
            v-model="formData.description.en"
            label="Description (en)"
            required
          />
        </VCol>
        <VCol cols="12" sm="10">
          <VTextarea
            v-model="formData.description.de"
            label="Description (de)"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5"><h1>Offered Courses</h1></VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol sm="10">
          <VSelect
            :items="oldPhasesSelect"
            :label="t('old-phases')"
            item-title="text"
            clearable
            @update:model-value="loadOldCourses"
          />
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
            justify="center"
            text="Create enrollment"
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
  old-phases: Passed Enroll Phases
de:
  old-phases: Vergangene Anmeldephasen
</i18n>
