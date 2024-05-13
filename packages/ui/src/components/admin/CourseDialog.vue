<script lang="ts" setup>
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { ref, watchEffect } from 'vue'
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
  VTextField,
  VTextarea,
} from 'vuetify/components'

import { dialogService } from '../DialogService'

const props = defineProps<{ selectedSubject?: Course; visible: boolean }>()
const emit = defineEmits<{ cancel: []; submit: [Course | undefined] }>()
const formData = ref<
  { lecturers: string; varyingCP: string } & Omit<
    Course,
    'lecturers' | 'varyingCP'
  >
>()

watchEffect(() => {
  if (props.selectedSubject) {
    formData.value = {
      ...props.selectedSubject,
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
</script>

<template>
  <VDialog
    :model-value="visible"
    max-width="1000"
    min-width="800"
    transition="false"
    width="auto"
    @update:model-value="$emit('cancel')"
  >
    <VCard
      v-if="formData"
      :title="
        t('title', [
          locale === 'en'
            ? selectedSubject?.title.en
            : selectedSubject?.title.de,
        ])
      "
      prepend-icon="mdi-pencil"
    >
      <template v-if="!selectedSubject?.moduleCode" #title>
        <div class="d-flex align-center" style="width: 30%">
          <span>{{ t('title') }} &nbsp;</span>
          <VTextField
            v-model="formData.moduleCode"
            :label="t('module-code')"
            autofocus
            hide-details
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
          <VCol>
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
              required
            />
          </VCol>
          <VCol cols="12" md="4" sm="6">
            <VTextField
              v-model="formData.creditPoints"
              :label="t('credit-points')"
              type="number"
              required
            />
          </VCol>
          <VCol>
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
              required
            />
          </VCol>
        </VRow>
        <small class="text-caption text-medium-emphasis">
          {{ t('hint.comma') }}
        </small>
      </VCardText>
      <VDivider />
      <template #actions>
        <VBtn :text="t('global.cancel')" @click="$emit('cancel')" />
        <VSpacer />
        <VSwitch
          v-model="formData.published"
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
          :disabled="!formData.moduleCode"
          :text="t('global.save')"
          @click="submit"
        />
      </template>
    </VCard>
  </VDialog>
</template>

<i18n lang="yaml">
en:
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
    comma: List separated by commas
  really-want-to-delete: Do you really want to delete this course?
de:
  title: 'Bearbeiten - {0}'
  title-en: Titel (Englisch)
  title-de: Titel (Deutsch)
  module-code: Modulcode
  editor-username: Nutzername des Bearbeiters
  semester-hours: Semesterstunden
  credit-points: Credit Points
  varying-cp: Variierende CP
  lecturers: Dozenten
  extra-info: Zusätzliche Informationen
  hint:
    comma: Liste mit Kommas getrennt
  really-want-to-delete: Möchten Sie diesen Kurs wirklich löschen?
</i18n>
