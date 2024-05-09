<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { trpc } from '@/api/trpc'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { merge } from 'lodash-es'
import { ref } from 'vue'

const adminStore = useAdminCoursesStore()

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
          <th class="text-left">Nr.</th>
          <th class="text-left">Name</th>
          <th class="text-left">Professor</th>
          <th>CP</th>
          <th>SWS</th>
          <th class="text-left">Edit</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in adminStore.courses" :key="subject.moduleCode">
          <td>{{ subject.moduleCode }}</td>
          <td>{{ subject.title.en }}</td>
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
      <VBtn>Save</VBtn>
    </VTable>
    <VDialog
      v-model="showModalForm"
      min-width="800"
      transition="false"
      width="auto"
    >
      <VCard
        :title="`Edit - ${selectedSubject.title.en}`"
        prepend-icon="mdi-pencil"
      >
        <VCardText>
          <VRow dense>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.title.en"
                label="Title (en)"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.title.de"
                label="Title (de)"
                required
              />
            </VCol>
            <VCol>
              <VTextField
                v-model="formData.editorUsername"
                label="Editor username"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.semesterHours"
                label="Semester Hours (SWS)"
                type="number"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.creditPoints"
                label="Credit points (CP)"
                type="number"
                required
              />
            </VCol>
            <VCol>
              <VTextField
                v-model="formData.varyingCP"
                hint="E.g. IN: 5, WIN:8,"
                label="Varying CP"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.lecturers"
                hint="separate with comma"
                label="Lecturers*"
                required
              />
            </VCol>
            <VCol>
              <VTextarea
                v-model="formData.extraInfo"
                label="Extra information"
                required
              />
            </VCol>
          </VRow>
          <small class="text-caption text-medium-emphasis"
            >*separate multiple elements with comma</small
          >
        </VCardText>
        <VDivider />
        <template #actions>
          <VBtn text="Cancel" @click="showModalForm = false" />
          <VBtn class="ms-auto" text="Save" @click="saveSubject" />
        </template>
      </VCard>
    </VDialog>
  </div>
</template>
