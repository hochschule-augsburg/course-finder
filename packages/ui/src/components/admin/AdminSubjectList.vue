<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { trpc } from '@/trpc'
import { mdiInvoiceTextPlus, mdiPencil } from '@mdi/js'
import { merge } from 'lodash-es'
import { ref } from 'vue'
import { VBtn, VContainer, VIcon, VTable } from 'vuetify/components'

import ErrorDialog from './ErrorDialog.vue'

const adminStore = useAdminCoursesStore()

const showModalForm = ref(false)

const selectedSubject = ref<Course>(adminStore.courses[0])
let dialogAction: ((e: Course) => Promise<void>) | undefined = undefined
const showErrorDialog = ref(false)
const errorDialogMessage = ref('')

function openNewDialog() {
  selectedSubject.value = {
    creditPoints: 0,
    editorUsername: null,
    exam: null,
    extraInfo: null,
    faculty: '',
    infoUrl: null,
    lecturers: [],
    maExam: null,
    moduleCode: '',
    published: false,
    semesterHours: 0,
    title: { de: '', en: '' },
    varyingCP: {},
  }
  dialogAction = createSubject
  showModalForm.value = true
}

function openEditDialog(subject: Course) {
  selectedSubject.value = subject
  dialogAction = updateSubject
  showModalForm.value = true
}

async function processSubject(subject: Course | undefined) {
  if (!subject) {
    showModalForm.value = false
    await trpc.admin.courses.delete.mutate({
      moduleCode: selectedSubject.value.moduleCode,
    })
    adminStore.courses.splice(
      adminStore.courses.findIndex(
        (e) => e.moduleCode === selectedSubject.value.moduleCode,
      ),
      1,
    )
  } else {
    await dialogAction?.(subject)
  }
  showModalForm.value = false
}

async function createSubject(subject: Course) {
  try {
    const result = await trpc.admin.courses.create.mutate(subject)
    adminStore.courses.push(result)
    // Perf is okay
    adminStore.courses.sort((a, b) => a.moduleCode.localeCompare(b.moduleCode))
  } catch {
    errorDialogMessage.value =
      'Fehler bei der Kurserstellung. Eingegebenes Modulkürzel könnte schon vergeben sein.'
    showErrorDialog.value = true
  }
}

async function updateSubject(subject: Course) {
  try {
    if (!subject.title.de && !subject.title.en) {
      throw new Error()
    }
    const result = await trpc.admin.courses.update.mutate(subject)
    merge(selectedSubject.value, result)
  } catch {
    errorDialogMessage.value =
      'Fehler bei der Kurseditierung. Modulkürzel muss einzigartig sein und mindestens ein Titel ist erforderlich.'
    showErrorDialog.value = true
  }
}
</script>

<template>
  <VContainer>
    <VTable height="1000px" fixed-header hover>
      <thead>
        <tr>
          <th class="text-left">
            <strong>Nr.</strong>
          </th>
          <th class="text-left">
            <strong>Name</strong>
          </th>
          <th class="text-left">
            <strong>Dozent</strong>
          </th>
          <th><strong>CP</strong></th>
          <th><strong>SWS</strong></th>
          <th>
            <VBtn @click="openNewDialog">
              Neu &nbsp; <VIcon :icon="mdiInvoiceTextPlus" />
            </VBtn>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in adminStore.courses" :key="subject.moduleCode">
          <td>{{ subject.moduleCode }}</td>
          <td>
            {{ subject.title.de }} <br />
            {{ subject.title.en }}
          </td>
          <td>{{ subject.lecturers.join(', ') }}</td>
          <td>{{ subject.creditPoints }}</td>
          <td>{{ subject.semesterHours }}</td>
          <td>
            <VBtn @click="openEditDialog(subject)">
              <VIcon :icon="mdiPencil" size="25" />
            </VBtn>
          </td>
        </tr>
      </tbody>
    </VTable>
    <CourseDialog
      :selected-subject="selectedSubject"
      :visible="showModalForm"
      @cancel="showModalForm = false"
      @submit="processSubject"
    />
    <ErrorDialog
      :message="errorDialogMessage"
      :visible="showErrorDialog"
      @close="showErrorDialog = false"
    />
  </VContainer>
</template>
