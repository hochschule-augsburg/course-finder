<script lang="ts" setup>
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { mdiPencil } from '@mdi/js'
import { ref, toRaw, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardText,
  VCol,
  VDialog,
  VDivider,
  VRow,
  VSpacer,
  VSwitch,
  VTextarea,
  VTextField,
} from 'vuetify/components'

import { dialogService } from '../DialogService'

const props = defineProps<{
  onTheFly?: boolean
  selectedSubject?: Course
  visible: boolean
}>()
const emit = defineEmits<{ cancel: []; submit: [Course | undefined] }>()
const formData = ref<
  { lecturers: string; varyingCP: string } & Omit<
    Course,
    'lecturers' | 'varyingCP'
  >
>()

watchEffect(() => {
  if (props.selectedSubject && props.visible) {
    formData.value = {
      ...structuredClone(toRaw(props.selectedSubject)),
      lecturers: props.selectedSubject.lecturers.join(', '),
      varyingCP: varyingCPToString(props.selectedSubject.varyingCP),
    }
  }
})

const { locale, t } = useI18n()

function varyingCPToString(varyingCP: unknown) {
  if (
    typeof varyingCP === 'object' &&
    varyingCP !== null &&
    !Array.isArray(varyingCP)
  ) {
    const keyValuePairs = Object.entries(varyingCP).map(([key, value]) => {
      return `${key}: ${value}`
    })

    const resultString = keyValuePairs.join(', ')
    return resultString
  }
  return ''
}

function parseVaryingCP(input: string) {
  const dictionary: { [key: string]: number } = {}
  const pairs = input
    .split(',')
    .map((pair) => pair.trim())
    .filter((item) => item !== '')

  pairs.forEach((pair) => {
    const [key, value] = pair.split(':').map((item) => item.trim())
    dictionary[key] = Number(value)
  })
  return dictionary
}

function submit() {
  if (!formData.value) {
    return
  }
  emit('submit', {
    ...formData.value,
    creditPoints: Number(formData.value.creditPoints),
    lecturers: formData.value.lecturers
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== ''),
    semesterHours: Number(formData.value.semesterHours),
    varyingCP: parseVaryingCP(formData.value.varyingCP),
  })
}

function deleteSubject() {
  dialogService.showDialog({
    onCancel: () => {},
    onConfirm: () => emit('submit', undefined),
    text: t('really-want-to-delete'),
    title: t('global.confirm'),
  })
}

const moduleCodeRequiredRule = [
  (i: string) => !!i || t('hint.module-code-required'),
]
</script>

<template>
  <VDialog
    :model-value="visible"
    max-width="1000"
    min-width="auto"
    transition="false"
    @update:model-value="$emit('cancel')"
  >
    <VCard
      v-if="formData"
      :prepend-icon="mdiPencil"
      :title="t('title', [selectedSubject?.title[locale]])"
    >
      <template v-if="!selectedSubject?.moduleCode" #title>
        <div class="d-flex align-center" style="width: 35%">
          <span>{{ t('createOnTheFly') }} &nbsp;</span>
          <VTextField
            v-model="formData.moduleCode"
            :label="t('module-code')"
            :rules="moduleCodeRequiredRule"
            hide-details="auto"
            min-width="150px"
            validate-on="input"
            autofocus
            required
          />
        </div>
      </template>
      <VCardText>
        <VRow dense>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.title.en"
              :label="t('title-en')"
              hide-details
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.title.de"
              :label="t('title-de')"
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.editorUsername"
              :label="t('editor-username')"
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.semesterHours"
              :label="t('semester-hours')"
              type="number"
              hide-details
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.creditPoints"
              :label="t('credit-points')"
              type="number"
              hide-details
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.varyingCP"
              :label="t('varying-cp')"
              required
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="formData.lecturers"
              :label="t('lecturers')"
              required
            />
          </VCol>
          <VCol>
            <VTextarea
              v-model="formData.extraInfo"
              :label="t('extra-info')"
              hide-details
              required
            />
          </VCol>
        </VRow>
        <small class="text-caption text-medium-emphasis">
          {{ t('hint.comma') }}
        </small>
        <br />
        <small
          v-if="!formData.title.de && !formData.title.en"
          class="text-caption"
          style="color: rgb(var(--v-theme-primary))"
        >
          {{ t('hint.title') }}
        </small>
      </VCardText>
      <VDivider />
      <template #actions>
        <VBtn :text="t('global.cancel')" @click="$emit('cancel')" />
        <VSpacer />
        <VSwitch
          v-model="formData.published"
          v-if="props.onTheFly !== true"
          color="primary"
          label="published"
          hide-details
        />
        <VBtn
          v-if="selectedSubject?.moduleCode"
          :text="t('global.delete')"
          @click="deleteSubject"
        />
        <VBtn
          :disabled="
            !formData.moduleCode || (!formData.title.de && !formData.title.en)
          "
          :text="t('global.save')"
          @click="submit"
        />
      </template>
    </VCard>
  </VDialog>
</template>

<i18n lang="yaml">
en:
  createOnTheFly: 'New Course - {0}'
  title: 'Edit - {0}'
  title-en: Title (English)
  title-de: Title (German)
  module-code: Module Code
  editor-username: Editor's Username
  semester-hours: Semester Hours
  credit-points: Credit Points
  varying-cp: Varying CP
  lecturers: Lecturers
  extra-info: Extra Information
  hint:
    comma: Lecturerlist separated by commas
    title: At least one title required
    module-code-required: required field
  really-want-to-delete: Do you really want to delete this course?
de:
  createOnTheFly: 'Neuer Kurs - {0}'
  title: 'Bearbeiten - {0}'
  title-en: Titel (Englisch)
  title-de: Titel (Deutsch)
  module-code: Modulkürzel
  editor-username: Nutzername des Bearbeiters
  semester-hours: Semesterstunden
  credit-points: Credit Points
  varying-cp: Variierende CP
  lecturers: Dozenten
  extra-info: Zusätzliche Informationen
  hint:
    comma: Dozentenliste mit Kommas getrennt
    title: Mindestens ein Titel ist erforderlich
    module-code-required: Feld erforderlich
  really-want-to-delete: Möchten Sie diesen Kurs wirklich löschen?
</i18n>
