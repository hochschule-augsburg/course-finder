<script setup lang="ts">
import type { Subject } from '@/stores/AdminStore'

import { useAdminStore } from '@/stores/AdminStore'
import { ref } from 'vue'

const adminStore = useAdminStore()

const showModalForm = ref(false)

const selectedSubject = ref<Subject>(adminStore.subjects[0])
const formData = ref({
  creditPoints: 0,
  editorUsername: '',
  extraInfo: '',
  lecturers: ['', ''],
  semesterHours: 0,
  title: { de: '', en: '' }, // [I18n]
  varyingCP: {},
})

function selectSubject(s: Subject) {
  selectedSubject.value = s
  formData.value.creditPoints = s.creditPoints
  formData.value.semesterHours = s.semesterHours
  formData.value.title.de = s.title.de ?? ''
  formData.value.title.en = s.title.en ?? ''
  //TODO: Assign varyingCP, extraInfo, editorUsername and lecturers
  showModalForm.value = true
  console.log(formData.value)
}

function saveSubject() {
  selectedSubject.value.title.en = formData.value.title.en
  selectedSubject.value.creditPoints = formData.value.creditPoints
  selectedSubject.value.semesterHours = formData.value.semesterHours
  selectedSubject.value.title.en = formData.value.title.en
  selectedSubject.value.title.de = formData.value.title.de
  //TODO: Assign varyingCP, extraInfo, editorUsername and lecturers
  //TODO: Save offered courses in selectedSubject
  showModalForm.value = false
  // TODO: Send request to backend and Change subject in store
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
        <tr v-for="subject in adminStore.subjects" :key="subject.moduleCode">
          <td>{{ subject.moduleCode }}</td>
          <td>{{ subject.title.en }}</td>
          <td>{{ subject.allLecturers.toString() }}</td>
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
                label="Extern lecturers*"
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
