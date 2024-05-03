<script setup lang="ts">
import type { Subject } from '@/stores/AdminStore'

import { useAdminStore } from '@/stores/AdminStore'
import { ref } from 'vue'

const adminStore = useAdminStore()

const showModalForm = ref(false)

const selectedSubject = ref<Subject>(adminStore.subjects[0])
const formData = ref({
  Lecturers: '',
  creditPoints: 0,
  description: { de: '', en: '' }, /// [I18n]
  examType: { for: '' },
  examinationNumbers: ['', ''],
  externLecturers: ['', ''],
  language: '',
  learningGoals: { de: '', en: '' }, /// [I18n]
  requirements: ['', ''],
  semesterHours: 0,
  title: { de: '', en: '' }, /// [I18n]
})

function selectSubject(s: Subject) {
  selectedSubject.value = s
  formData.value.Lecturers = getLecturers(s.Lecturers)
  formData.value.creditPoints = s.creditPoints
  formData.value.description.de = s.description.de ?? ''
  formData.value.description.en = s.description.en ?? ''
  formData.value.examType.for = s.examType.for
  formData.value.examinationNumbers = s.examinationNumbers
  formData.value.externLecturers = s.externLecturers
  formData.value.language = s.language
  formData.value.learningGoals.de = s.learningGoals.de ?? ''
  formData.value.learningGoals.en = s.learningGoals.en ?? ''
  formData.value.requirements = s.requirements
  formData.value.semesterHours = s.semesterHours
  formData.value.title.de = s.title.de ?? ''
  formData.value.title.en = s.title.en ?? ''
  showModalForm.value = true
  console.log(formData.value)
}

function saveSubject() {
  selectedSubject.value.title.en = formData.value.title.en
  selectedSubject.value.Lecturers = parseLecturers(formData.value.Lecturers)
  selectedSubject.value.creditPoints = formData.value.creditPoints
  selectedSubject.value.description.en = formData.value.description.en
  selectedSubject.value.description.de = formData.value.description.de
  selectedSubject.value.examType.for = formData.value.examType.for
  selectedSubject.value.examinationNumbers = formData.value.examinationNumbers
  selectedSubject.value.externLecturers = formData.value.externLecturers
  selectedSubject.value.language = formData.value.language
  selectedSubject.value.learningGoals.en = formData.value.learningGoals.en
  selectedSubject.value.learningGoals.de = formData.value.learningGoals.de
  selectedSubject.value.requirements = formData.value.requirements
  selectedSubject.value.semesterHours = formData.value.semesterHours
  selectedSubject.value.title.en = formData.value.title.en
  selectedSubject.value.title.de = formData.value.title.de

  showModalForm.value = false
  // TODO: Change subject in store
  // TODO: Send request to backend
  console.log(selectedSubject.value)
  console.log(selectedSubject.value.moduleCode)
}

type Lecturer = {
  name: string
  username: string
}

function parseLecturers(lecturers: string) {
  return lecturers.split(',').map((name) => ({
    name: name.trim(),
    username: '',
  }))
}

function getLecturers(lecturers: Lecturer[]) {
  return lecturers ? lecturers.map((lecturer) => lecturer.name).join(', ') : ''
}
</script>

<template>
  <div>
    <VTable>
      <thead>
        <tr>
          <th class="text-left">Name</th>
          <th class="text-left">Professor</th>
          <th class="text-left">Edit</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in adminStore.subjects" :key="subject.moduleCode">
          <td>{{ subject.title.en }}</td>
          <td>{{ subject.allLecturers.toString() }}</td>
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
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.Lecturers"
                hint="separate with comma"
                label="Lecturers*"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.externLecturers"
                hint="separate with comma"
                label="Extern lecturers*"
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
                v-model="formData.examinationNumbers"
                label="Examination numbers*"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                v-model="formData.examType.for"
                label="Exam type"
                required
              />
            </VCol>
            <VCol md="4" sm="12">
              <VSelect
                v-model="formData.language"
                :items="['German', 'English']"
                label="Language"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="formData.requirements"
                label="Requirements"
                required
              />
            </VCol>
            <VCol cols="6">
              <VTextarea
                v-model="formData.description.en"
                label="Description (en)"
                type="text"
                required
              />
            </VCol>
            <VCol cols="6">
              <VTextarea
                v-model="formData.description.de"
                label="Description (de)"
                type="text"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="formData.learningGoals.en"
                label="Learning goals (en)"
                type="text"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="formData.learningGoals.de"
                label="Learning goals (de)"
                type="text"
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
