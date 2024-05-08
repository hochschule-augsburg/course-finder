<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'

import { useCoursesStore } from '@/stores/CoursesStore'
import { reactive, ref } from 'vue'

const coursesStore = useCoursesStore()

/*Following code handles the logic for drag and drop */
const tableOne: Subject[] = reactive(coursesStore.subjects)
//TODO: Always offered courses should be automatically in tableTwo
const tableTwo: Subject[] = reactive([])

function startDrag(event: DragEvent, subject: Subject, table: string): void {
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

  if (indexInTableOne >= 0 && tableID !== droppedTable) {
    const foundSubject = tableOne.find((item) => item.moduleCode === itemID)
    if (foundSubject !== undefined) {
      tableTwo.push(foundSubject)
      tableOne.splice(indexInTableOne, 1)
    }
    //TODO: Remove subject from offeredCourseList if its there
  } else if (indexInTableTwo >= 0 && tableID !== droppedTable) {
    const foundSubject = tableTwo.find((item) => item.moduleCode === itemID)
    if (foundSubject !== undefined) {
      tableOne.push(foundSubject)
      tableTwo.splice(indexInTableTwo, 1)
    }
  }
}

/*The following code handles the logic for the edit form of an course */
type TimeInterval<Date> = { from: Date; to: Date }

type CourseAppointmentsJson<Date> = {
  dates: Array<TimeInterval<Date>>
  type: 'block' | 'irregular' | 'weekly'
}

const showModalForm = ref(false)

interface SharedObject {
  array: [
    {
      appointments: {
        dates: Array<{ from: Date; to: Date }>
        type: 'block' | 'irregular' | 'weekly'
      }
      extraInfo: string
      for: string[]
      maxParticipants: number
      minParticipants: number
      moduleCode: string
    },
  ]
}

const props = defineProps<{
  offeredCoursesArray: SharedObject | undefined
}>()

const offeredCoursesArray = ref(props.offeredCoursesArray)

const selectedSubject = ref<Subject>(coursesStore.subjects[0])
const initialAppointment: CourseAppointmentsJson<Date> = {
  dates: [],
  type: 'weekly',
}
const formData = ref({
  appointments: initialAppointment,
  extraInfo: '',
  for: '',
  maxParticipants: 0,
  minParticipants: 0,
})

function selectSubject(s: Subject) {
  //Remove dummy interval item
  intervals.value = intervals.value.filter((interval) => interval.id !== -1)

  selectedSubject.value = s

  if (s.offeredCourse !== undefined) {
    formData.value.extraInfo = s.offeredCourse.extraInfo ?? ''
    formData.value.maxParticipants = s.offeredCourse.maxParticipants ?? 0
    formData.value.minParticipants = s.offeredCourse.minParticipants
    formData.value.for = s.offeredCourse.for.join(', ')

    generateCourseInterval(s.offeredCourse.appointments.dates, s.moduleCode)
    isChecked(s.offeredCourse.appointments.type)
  }
  showModalForm.value = true
}

function saveSubject() {
  // TODO: Forward offeredCourseData to AdminCreateEnroll
  // TODO: Mirror change in store
  const offeredCourseData = {
    appointments: getAppointmentData(selectedSubject.value.moduleCode),
    extraInfo: formData.value.extraInfo,
    for: formData.value.for.split(',').map((item) => item.trim()),
    maxParticipants: formData.value.maxParticipants,
    minParticipants: formData.value.minParticipants,
    moduleCode: selectedSubject.value.moduleCode,
  }
  offeredCoursesArray.value?.array.push(offeredCourseData)
  console.log('offeredCourse pushed')
  showModalForm.value = false
}

function getAppointmentData(moduleCode: string) {
  const datesArray: Array<{
    from: Date
    to: Date
  }> = []
  const courseIntervals = intervals.value.filter(
    (inter) => inter.of === moduleCode,
  )
  courseIntervals.forEach(function (interval) {
    datesArray.push({
      from: new Date(interval.from),
      to: new Date(interval.to),
    })
  })

  const appointmentType = getAppointmentType()
  return { dates: datesArray, type: appointmentType }
}

function getAppointmentType(): 'block' | 'irregular' | 'weekly' {
  if (checkedString.checked === 'weekly') {
    return 'weekly'
  } else if (checkedString.checked === 'block') {
    return 'block'
  }
  return 'irregular'
}

/*The following code handles the logic to create and delete date 
intervals for course appointments*/
let dateId = 0

const intervals = ref([{ from: '', id: -1, of: '', to: '' }])

function getInterval(moduleCode: string) {
  const intervalArray = intervals.value.filter(
    (inter) => inter.of === moduleCode,
  )
  if (intervalArray.length === 0) {
    addInterval(moduleCode)
  }
  return intervals.value.filter((inter) => inter.of === moduleCode)
}

function generateCourseInterval(
  dates: Array<TimeInterval<Date>>,
  moduleCode: string,
) {
  dates.forEach(function (date) {
    addInterval(
      moduleCode,
      new Date(date.from.getTime() - date.to.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
      new Date(date.to.getTime() - date.to.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16),
    )
  })
}

function addInterval(moduleCode: string, from?: string, to?: string) {
  // Check if same object exists (except for id)
  const existingIndex = intervals.value.findIndex(
    (interval) =>
      interval.from === from &&
      interval.of === moduleCode &&
      interval.to === to,
  )

  // If the object doesn't exist, push the new object
  if (existingIndex === -1) {
    intervals.value.push({
      from: from ?? '',
      id: dateId++,
      of: moduleCode,
      to: to ?? '',
    })
  }
}

function removeInterval(index: number) {
  intervals.value = intervals.value.filter((inter) => inter.id !== index)
}

function getDisplayDate(date: Date) {
  return date.toLocaleString('en-GB').replaceAll('/', '.')
}

/*Prefill radio button group*/
const checkedString = reactive({
  checked: '',
})

function isChecked(type: string) {
  checkedString.checked = ''
  if (type === 'weekly') {
    checkedString.checked = 'weekly'
  } else if (type === 'block') {
    checkedString.checked = 'block'
  } else if (type === 'irregular') {
    checkedString.checked = 'irregular'
  }
}
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
            {{ subject.title.en }}
            <a @click="selectSubject(subject)"
              ><VIcon class="pencil-icon" size="20">mdi-pencil</VIcon></a
            >
            <div>Type: {{ subject.offeredCourse?.appointments.type }}</div>
            <div
              v-for="(timespan, index) in subject.offeredCourse?.appointments
                .dates"
              :key="index"
            >
              <div>
                <strong>From:</strong>
                {{ getDisplayDate(timespan.from) }}
                <strong>To:</strong>
                {{ getDisplayDate(timespan.to) }}
              </div>
            </div>
            <div>
              Min participants:
              {{ subject.offeredCourse?.minParticipants }}
              Max participants:
              {{ subject.offeredCourse?.maxParticipants }}
            </div>
            <div>
              Extra information:
              {{ subject.offeredCourse?.extraInfo }}
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
              <VTextField
                v-model="formData.for"
                hint="E.g. IN, WIN, TI,"
                label="For fields of study"
                required
              />
            </VCol>
            <VCol cols="12">
              <VIcon>mdi-calendar</VIcon><Strong>Appointment(s)</Strong>
              <div
                v-for="(interval, index) in getInterval(
                  selectedSubject.moduleCode,
                )"
                :key="interval.id"
              >
                <div style="display: flex">
                  Date Id: {{ interval.id }}
                  <div v-if="index !== 0">
                    <VIcon @click="removeInterval(interval.id)">
                      mdi-trash-can-outline
                    </VIcon>
                  </div>
                </div>
                <VTextField
                  v-model="interval.from"
                  label="from"
                  type="datetime-local"
                  required
                />
                <VTextField
                  v-model="interval.to"
                  label="to"
                  type="datetime-local"
                  required
                />
              </div>
              <VBtn @click="addInterval(selectedSubject.moduleCode)">
                Add Date
              </VBtn>
            </VCol>
            <VCol>
              <VRadioGroup v-model="checkedString.checked" inline>
                <VRadio label="weekly" value="weekly" />
                <VRadio label="block" value="block" />
                <VRadio label="irregular" value="irregular" />
              </VRadioGroup>
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
          <VBtn class="ms-auto" text="Save" @click="saveSubject" />
        </template>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<style scoped lang="scss">
$backgroundColor: #ecf0f1;
$itemBackgroundColor: #ecf0f1;
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

.pencil-icon {
  cursor: pointer;
}
</style>
