<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { trpc } from '@/api/trpc'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { merge } from 'lodash-es'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardText,
  VCol,
  VDialog,
  VDivider,
  VIcon,
  VRow,
  VTable,
  VTextField,
} from 'vuetify/components'

const adminStore = useAdminCoursesStore()

const { locale, t } = useI18n()

const showModalForm = ref(false)

const selectedSubject = ref<Course>(adminStore.courses[0])
const formData = ref({
  creditPoints: 0,
  editorUsername: '',
  extraInfo: '',
  facultyName: '',
  lecturers: '',
  semesterHours: 0,
  title: { de: '', en: '' }, // [I18n]
  varyingCP: '',
})

function selectSubject(s: Course) {
  selectedSubject.value = s
  formData.value.creditPoints = s.creditPoints
  formData.value.semesterHours = s.semesterHours
  formData.value.facultyName = s.facultyName ?? ''
  formData.value.title.de = s.title.de ?? ''
  formData.value.title.en = s.title.en ?? ''
  formData.value.lecturers = s.lecturers.join(', ')
  formData.value.varyingCP = varyingCPToString(s.varyingCP)
  formData.value.extraInfo = s.extraInfo ?? ''
  formData.value.editorUsername = s.editorUsername ?? ''

  showModalForm.value = true
}

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

async function saveSubject() {
  const inputData = {
    creditPoints: Number(formData.value.creditPoints),
    editorUsername: formData.value.editorUsername,
    extraInfo: formData.value.extraInfo,
    facultyName: formData.value.facultyName,
    lecturers: formData.value.lecturers
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== ''),
    moduleCode: selectedSubject.value.moduleCode,
    semesterHours: Number(formData.value.semesterHours),
    title: {
      de: formData.value.title.de,
      en: formData.value.title.en,
    },
    varyingCP: parseVaryingCP(formData.value.varyingCP),
  }
  try {
    const result = await trpc.admin.courses.update.mutate(inputData)
    merge(selectedSubject.value, result)
  } catch (e) {
    console.log('Error updating Subject')
  }
  showModalForm.value = false
}
</script>

<template>
  <div>
    <VTable>
      <thead>
        <tr>
          <th class="text-left">{{ t('no.') }}</th>
          <th class="text-left">{{ t('name') }}</th>
          <th class="text-left">{{ t('lecturer') }}</th>
          <th>CP</th>
          <th>SWS</th>
          <th class="text-left">{{ t('global.edit') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in adminStore.courses" :key="subject.moduleCode">
          <td>{{ subject.moduleCode }}</td>
          <td>{{ locale === 'en' ? subject.title.en : subject.title.de }}</td>
          <td>{{ subject.lecturers.toString() }}</td>
          <td>{{ subject.creditPoints }}</td>
          <td>{{ subject.semesterHours }}</td>
          <td>
            <VBtn @click="selectSubject(subject)">
              <VIcon size="25">mdi-pencil</VIcon>
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDialog
      v-model="showModalForm"
      max-width="1000"
      min-width="800"
      transition="false"
      width="auto"
    >
      <VCard
        :title="
          t('edit-title', [
            locale === 'en'
              ? selectedSubject.title.en
              : selectedSubject.title.de,
          ])
        "
        prepend-icon="mdi-pencil"
      >
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.title.en"
                :label="t('dialog.title-en')"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.title.de"
                :label="t('dialog.title-de')"
                required
              />
            </VCol>
            <VCol>
              <VTextField
                v-model="formData.editorUsername"
                :label="t('dialog.editor-username')"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.semesterHours"
                :label="$t('dialog.semester-hours')"
                type="number"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.creditPoints"
                :label="$t('dialog.credit-points')"
                type="number"
                required
              />
            </VCol>
            <VCol>
              <VTextField
                v-model="formData.varyingCP"
                :label="$t('dialog.varying-cp')"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.lecturers"
                :label="$t('dialog.lecturers')"
                required
              />
            </VCol>
            <VCol>
              <VTextarea
                v-model="formData.extraInfo"
                :label="$t('dialog.extra-info')"
                required
              />
            </VCol>
          </VRow>
          <small class="text-caption text-medium-emphasis">{{
            t('dialog.hint.comma')
          }}</small>
        </VCardText>
        <VDivider />
        <template #actions>
          <VBtn :text="t('global.cancel')" @click="showModalForm = false" />
          <VBtn :text="t('global.save')" class="ms-auto" @click="saveSubject" />
        </template>
      </VCard>
    </VDialog>
  </div>
</template>

<i18n lang="yaml">
en:
  edit: Edit
  name: Name
  lecturer: Lecturer
  no.: No.
  dialog:
    title: 'Edit - {0}'
    title-en: Title (English)
    title-de: Title (German)
    editor-username: Editor's Username
    semester-hours: Semester Hours
    credit-points: Credit Points
    varying-cp: Varying CP
    lecturers: Lecturers
    extra-info: Extra Information
    hint:
      comma: List separated by comas
de:
  name: Name
  lecturer: Dozent
  no.: Nr.
  dialog:
    title: 'Bearbeiten - {0}'
    title-en: Titel (Englisch)
    title-de: Titel (Deutsch)
    editor-username: Nutzername des Bearbeiters
    semester-hours: Semesterstunden
    credit-points: Credit Points
    varying-cp: Variierende CP
    lecturers: Dozenten
    extra-info: Zusätzliche Informationen
    hint:
      comma: List mit Kommas getrennt
</i18n>
