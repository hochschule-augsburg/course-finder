<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { trpc } from '@/trpc'
import { mdiInvoiceTextPlus, mdiPencil } from '@mdi/js'
import { merge } from 'lodash-es'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VContainer, VIcon, VTable } from 'vuetify/components'

const adminStore = useAdminCoursesStore()

const { locale, t } = useI18n()

const showModalForm = ref(false)

const selectedSubject = ref<Course>(adminStore.courses[0])
let dialogAction: ((e: Course) => Promise<void>) | undefined = undefined

function openNewDialog() {
  selectedSubject.value = {
    creditPoints: 0,
    editorUsername: null,
    extraInfo: null,
    facultyName: null,
    infoUrl: null,
    lecturers: [],
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
  } catch (e) {
    console.log('Error creating Subject')
  }
}

async function updateSubject(subject: Course) {
  try {
    const result = await trpc.admin.courses.update.mutate(subject)
    merge(selectedSubject.value, result)
  } catch (e) {
    console.log('Error updating Subject')
  }
}
</script>

<template>
  <VContainer>
    <VTable height="1000px" fixed-header hover rounded>
      <thead>
        <tr>
          <th class="text-left">
            <strong>{{ t('no.') }}</strong>
          </th>
          <th class="text-left">
            <strong>{{ t('name') }}</strong>
          </th>
          <th class="text-left">
            <strong>{{ t('lecturer') }}</strong>
          </th>
          <th><strong>CP</strong></th>
          <th><strong>SWS</strong></th>
          <th>
            <VBtn @click="openNewDialog">
              {{ t('new') }} &nbsp; <VIcon :icon="mdiInvoiceTextPlus" />
            </VBtn>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="subject in adminStore.courses" :key="subject.moduleCode">
          <td>{{ subject.moduleCode }}</td>
          <td>{{ locale === 'en' ? subject.title.en : subject.title.de }}</td>
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
  </VContainer>
</template>

<i18n lang="yaml">
en:
  edit: Edit
  name: Name
  lecturer: Lecturer
  no.: No.
  new: New
de:
  name: Name
  lecturer: Dozent
  no.: Nr.
  new: Neu
</i18n>
