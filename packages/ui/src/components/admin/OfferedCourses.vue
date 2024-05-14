<script setup lang="ts">
import type { Subject } from '@/stores/CoursesStore'
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { merge } from 'lodash-es'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

import type { OfferedCourseData } from './types'

const offeredCoursesArray = defineModel<OfferedCourseData[]>({ required: true })

const coursesStore = useAdminCoursesStore()
const { locale, t } = useI18n()

/*Following code handles the logic for drag and drop */
const tableOne: Course[] = reactive([...coursesStore.courses])

function startDrag(event: DragEvent, moduleCode: string, table: string): void {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('itemID', moduleCode)
    event.dataTransfer.setData('tableID', table)
  }
}

function onDrop(event: DragEvent, droppedTable: string): void {
  const itemID = event.dataTransfer?.getData('itemID')
  const tableID = event.dataTransfer?.getData('tableID')

  const indexInTableOne = tableOne.findIndex(
    (item) => item.moduleCode === itemID,
  )
  const indexInTableTwo = offeredCoursesArray.value.findIndex(
    (item) => item.moduleCode === itemID,
  )
  console.log(itemID, tableID, droppedTable, indexInTableOne, indexInTableTwo)

  if (indexInTableOne >= 0 && tableID !== droppedTable) {
    const foundSubject = tableOne.find((item) => item.moduleCode === itemID)
    if (foundSubject !== undefined) {
      offeredCoursesArray.value.push({
        Course: foundSubject,
        appointments: { dates: [], type: 'weekly' },
        extraInfo: null,
        for: [],
        maxParticipants: null,
        minParticipants: 0,
        moduleCode: foundSubject.moduleCode,
        moodleCourse: null,
      })
      tableOne.splice(indexInTableOne, 1)
      handlePuttingInAgainLogic(foundSubject)
    }
    //TODO: Remove subject from offeredCourseArray if its there
  } else if (indexInTableTwo >= 0 && tableID !== droppedTable) {
    const foundSubject = coursesStore.courses.find(
      (item) => item.moduleCode === itemID,
    )
    if (foundSubject !== undefined) {
      tableOne.push(foundSubject)
      offeredCoursesArray.value.splice(indexInTableTwo, 1)
      handlePuttingBackLogic(foundSubject)
    }
  }
}

const removeStore = ref<OfferedCourseData[]>([])

function handlePuttingBackLogic(subject: Subject) {
  console.log(subject)
  //Retrieve the data from the shared object
  const offeredCourseData = offeredCoursesArray.value.filter(
    (course) => course.moduleCode === subject.moduleCode,
  )
  //Remove the data from the shared object
  offeredCoursesArray.value = offeredCoursesArray.value.filter(
    (course) => course.moduleCode !== subject.moduleCode,
  )
  //Remove old data in case it is already in removeStore
  removeStore.value = removeStore.value.filter(
    (data) => data.moduleCode !== subject.moduleCode,
  )
  //Put retrieved data in removeStore
  offeredCourseData.forEach(function (data) {
    removeStore.value.push(data)
  })
}

function handlePuttingInAgainLogic(subject: Subject) {
  //Try to retrieve data from remove store
  const offeredCourseData = removeStore.value.filter(
    (data) => data.moduleCode === subject.moduleCode,
  )
  //Remove data from remove store
  removeStore.value = removeStore.value.filter(
    (data) => data.moduleCode !== subject.moduleCode,
  )
  //Putting back data in shared object if it is there
  if (offeredCourseData !== undefined) {
    offeredCourseData.forEach(function (data) {
      offeredCoursesArray.value.push(data)
    })
  }
}

function getDisplayDate(date: Date) {
  return date.toLocaleString('en-GB').replaceAll('/', '.')
}

const editOfferedCourse = ref<number>(-1)
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12" md="6">
        {{ t('available-courses') }}
      </VCol>
      <VCol cols="12" md="6">
        {{ t('offered-courses') }}
      </VCol>
    </VRow>

    <br />
    <VRow>
      <VCol class="off-course" cols="12" md="6">
        <Draggable
          :list="tableOne"
          class="list-group"
          ghost-class="ghost"
          group="courses"
          item-key="moduleCode"
        >
          <template #item="{ element }">
            <div class="list-group-item">
              {{ element.title.en }}
            </div>
          </template>
        </Draggable>
      </VCol>
      <VCol class="off-course" cols="12" md="6">
        <Draggable
          :list="offeredCoursesArray"
          class="list-group"
          ghost-class="ghost"
          group="courses"
          item-key="moduleCode"
        >
          <template #item="{ element }">
            <div class="list-group-item">
              {{ element.title.en }}
            </div>
          </template>
        </Draggable>
      </VCol>
    </VRow>
    <EditOfferedCourse
      :offered-course="offeredCoursesArray.at(editOfferedCourse)"
      :visible="editOfferedCourse !== -1"
      @cancel="editOfferedCourse = -1"
      @submit="
        (result) => {
          if (!result) {
            return
          }
          offeredCoursesArray[editOfferedCourse ?? -1] = merge(
            offeredCoursesArray.at(editOfferedCourse),
            result,
          )
          editOfferedCourse = -1
        }
      "
    />
  </div>
</template>

<i18n lang="yaml">
en:
  available-courses: Available courses
  offered-courses: Offered courses
  type: Type
  from: From
  to: To
  min-participants: Min participants
  max-participants: Max participants
  extra-info: Extra information
de:
  available-courses: Verfügbare Kurse
  offered-courses: Angebote Kurse
  type: Typ
  from: Von
  to: Bis
  min-participants: Mindestteilnehmer
  max-participants: Maximale Teilnehmer
  extra-info: Zusätzliche Informationen
</i18n>

<style scoped lang="scss">
$backgroundColor: #ecf0f1;
$itemBackgroundColor: #ecf0f1;
$borderColor: #ff266d;
$itemColor: #000000;
$paddingValue: 1%;

.drop-zone {
  width: 50%;
  background-color: $backgroundColor;
  padding: $paddingValue;
  min-height: 10%;
  max-height: 70em;
  overflow-y: auto;
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

.dateId-box {
  padding-top: $paddingValue;
}

.left-column {
  float: left;
  width: 50%;
}

.right-column {
  float: right;
  width: 50%;
}

.off-course {
  max-height: 700px;
  overflow-y: auto;
}
</style>
