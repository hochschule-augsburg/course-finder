<script setup lang="ts">
import type { Subject } from '@/stores/AdminStore'

import { useAdminStore } from '@/stores/AdminStore'
import { ref } from 'vue'

const adminStore = useAdminStore()

const showModalForm = ref(false)
const selectedSubject = ref<Subject>(adminStore.subjects[0])

const formData = ref({
  creditPoints: 0,
  description: {},
  examType: {},
  examinationNumbers: [] as string[],
  externLecturers: [] as string[],
  language: '',
  lecturers: [] as any[],
  semesterHours: 0,
  title: {},
})

function selectSubject(s: Subject) {
  selectedSubject.value = s
  // Prefill form data with selected subject's data
  formData.value.title = s.title
  formData.value.lecturers = s.Lecturers
  formData.value.externLecturers = s.externLecturers
  formData.value.creditPoints = s.creditPoints
  formData.value.description = s.description
  formData.value.examType = s.examType
  formData.value.examinationNumbers = s.examinationNumbers
  formData.value.semesterHours = s.semesterHours
  showModalForm.value = true
}

function saveSubject() {
  selectedSubject.value.title = formData.value.title
  //TODO: ????
  selectedSubject.value.Lecturers = formData.value.lecturers
  selectedSubject.value.externLecturers = formData.value.externLecturers
  showModalForm.value = false
}

interface Lecturer {
  name: string
  username: string
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
              <VTextField v-model="formData.title" label="Title" required />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                :model-value="getLecturers(selectedSubject.Lecturers)"
                hint="separate with comma"
                label="Lecturers*"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                :model-value="selectedSubject.externLecturers"
                hint="separate with comma"
                label="Extern lecturers*"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                :model-value="selectedSubject.creditPoints"
                label="Credit points (CP)"
                type="number"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                :model-value="selectedSubject.semesterHours"
                label="Semester Hours (SWS)"
                type="number"
                required
              />
            </VCol>
            <VCol cols="12" md="4" sm="6">
              <VTextField
                :model-value="selectedSubject.examinationNumbers"
                label="Examination numbers*"
                required
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField
                :model-value="selectedSubject.examType.for"
                label="Exam type"
                required
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VSelect
                :items="['German', 'English']"
                :model-value="selectedSubject.language"
                label="Language"
                required
              />
            </VCol>
            <VCol>
              <VTextarea
                :model-value="selectedSubject.description.en"
                label="Description"
                type="text"
                required
              />
            </VCol>
          </VRow>
          <small class="text-caption text-medium-emphasis"
            >*separate multiple elements with ,</small
          >
        </VCardText>
        <VDivider />
        <template #actions>
          <VBtn text="Cancel" @click="showModalForm = false" />
          <VBtn class="ms-auto" text="Save" @click="showModalForm = false" />
        </template>
      </VCard>
    </VDialog>
  </div>
</template>
