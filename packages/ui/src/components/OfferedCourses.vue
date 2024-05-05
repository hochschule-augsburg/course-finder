<script setup lang="ts">
import type { Subject } from '@/stores/AdminStore'

import { useAdminStore } from '@/stores/AdminStore'
import { reactive, ref } from 'vue'

type TimeInterval<T> = { from: T; to: T }

export type CourseAppointmentsJson<T> =
  | {
      /**
       * Ignore days, months and years
       */
      dates: Array<TimeInterval<T>>
      type: 'weekly'
    }
  | {
      dates: Array<TimeInterval<T>>
      type: 'block' | 'irregular'
    }

const enrollmentStore = useAdminStore()

const tableOne: Subject[] = reactive(enrollmentStore.subjects)
//TODO: Always offered courses should be automatically in tableTwo
const tableTwo: Subject[] = reactive([])

function startDrag(event: DragEvent, subject: Subject, table: string): void {
  console.log(subject)

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('itemID', subject.moduleCode)
    event.dataTransfer.setData('tableID', table)
  }
}

function onDrop(event: DragEvent, droppedTable: string): void {
  const itemID = event.dataTransfer?.getData('itemID')
  const tableID = event.dataTransfer?.getData('tableID')

  const indexInTableOne = tableOne.findIndex(
    (item) => item.moduleCode === itemID,
  )
  const indexInTableTwo = tableTwo.findIndex(
    (item) => item.moduleCode === itemID,
  )

  if (indexInTableOne >= 0) {
    if (tableID !== droppedTable) {
      const foundSubject = tableOne.find((item) => item.moduleCode === itemID)
      tableTwo.push(foundSubject)
      tableOne.splice(indexInTableOne, 1)
    }
  } else if (indexInTableTwo >= 0) {
    if (tableID !== droppedTable) {
      const foundSubject = tableTwo.find((item) => item.moduleCode === itemID)
      tableOne.push(foundSubject)
      tableTwo.splice(indexInTableTwo, 1)
    }
  }
}

const showModalForm = ref(false)
const offeredCourseList = []

const selectedSubject = ref<Subject>(enrollmentStore.subjects[0])
const formData = ref({
  appointments: {} as CourseAppointmentsJson<Date>,
  extraInfo: '',
  maxParticipants: 0,
  minParticipants: 0,
  moduleCode: '',
})

function selectSubject(s: Subject) {
  selectedSubject.value = s
  formData.value.moduleCode = s.moduleCode
  formData.value.appointments = s.offeredCourse.appointments
  formData.value.extraInfo = s.offeredCourse.extraInfo ?? ''
  formData.value.maxParticipants = s.offeredCourse.maxParticipants ?? 0
  formData.value.minParticipants = s.offeredCourse.minParticipants ?? 0
  showModalForm.value = true
  console.log(formData.value)
}

function saveSubject() {
  selectedSubject.value.offeredCourse.moduleCode = formData.value.moduleCode
  selectedSubject.value.offeredCourse.appointments = formData.value.appointments
  selectedSubject.value.offeredCourse.extraInfo = formData.value.extraInfo
  selectedSubject.value.offeredCourse.maxParticipants =
    formData.value.maxParticipants
  selectedSubject.value.offeredCourse.minParticipants =
    formData.value.minParticipants

  offeredCourseList.push(selectedSubject)
  showModalForm.value = false
  // TODO: Change subject in store
}

// TODO: Send offeredcourselist object to backend
</script>

<template>
  <VContainer>
    <VRow>
      <VCol cols="12" lg="6">
        <div
          class="drop-zone"
          @dragenter.prevent
          @dragover.prevent
          @drop="onDrop($event, 'table1')"
        >
          <div>Course</div>
          <div
            v-for="subject in tableOne"
            :key="subject.moduleCode"
            class="drag-el"
            draggable="true"
            @dragstart="startDrag($event, subject, 'table1')"
          >
            {{ subject.title.en }}
          </div>
        </div>
      </VCol>
      <VCol cols="12" lg="6">
        <div
          class="drop-zone"
          @dragenter.prevent
          @dragover.prevent
          @drop="onDrop($event, 'table2')"
        >
          <div>Offered courses</div>
          <div
            v-for="subject in tableTwo"
            :key="subject.moduleCode"
            class="drag-el"
            draggable="true"
            @dragstart="startDrag($event, subject, 'table2')"
          >
            {{ subject.title.en }} <a @click="selectSubject(subject)">- Edit</a>
            <div>
              {{ subject.offeredCourse.appointments.dates }}
            </div>
            <div>
              {{ subject.offeredCourse.minParticipants }}
              {{ subject.offeredCourse.maxParticipants }}
              {{ subject.offeredCourse.extraInfo }}
            </div>
          </div>
        </div>
      </VCol>
    </VRow>
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
            <VCol cols="12" md="6">
              <VTextField
                v-model="formData.minParticipants"
                label="Minimum participants"
                type="number"
                required
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                v-model="formData.maxParticipants"
                label="Maximum participants"
                type="number"
                required
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="formData.appointments.dates"
                label="Appointments"
                required
              />
            </VCol>
            <VCol cols="12">
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
          <VBtn class="ms-auto" text="Save" @click="showModalForm = false" />
        </template>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped lang="scss">
$backgroundColor: #ecf0f1;
$itemBackgroundColor: #ffffff;
$borderColor: #ff266d;
$itemColor: #000000;
$paddingValue: 1%;

.drop-zone {
  width: 95%;
  background-color: $backgroundColor;
  padding: $paddingValue;
  min-height: 10%;
}

.drag-el {
  background-color: $itemBackgroundColor;
  border-color: $borderColor;
  border-radius: $paddingValue;
  border-style: solid;
  color: $itemColor;
  padding: $paddingValue;
}
</style>
