<script setup lang="ts">
import type { OfferedCourseData } from '@/components/admin/types'
import type { Subject } from '@/stores/CoursesStore'
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import { VCol, VDivider, VRow } from 'vuetify/components'

import type { OfferedCourseData } from './types'

const offeredCoursesArray = defineModel<OfferedCourseData[]>({ required: true })

const coursesStore = useAdminCoursesStore()
const { locale, t } = useI18n()

/*Following code handles the logic for drag and drop */
const tableOne: Course[] = reactive([...coursesStore.courses])

/*function startDrag(event: DragEvent, moduleCode: string, table: string): void {
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
}*/

const removeStore = ref<OfferedCourseData[]>([])

function handlePuttingBackLogic(subject: Subject) {
  console.log(subject)
  //Retrieve the data from the shared object
  const offeredCourseData = offeredCoursesArray.value.filter(
    (course) => course.moduleCode === subject.moduleCode,
  )
  //Remove the data from the shared object
  /*offeredCoursesArray.value = offeredCoursesArray.value.filter(
    (course) => course.Course.moduleCode !== subject.moduleCode,
  )*/
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
      return true
    })
  }
  return false
}

function getDisplayDate(date: Date) {
  return date.toLocaleString('en-GB').replaceAll('/', '.')
}

const editOfferedCourse = ref<number>(-1)

interface ChangeEvent {
  added?: {
    element: Course | OfferedCourseData
    newIndex: number
  }
  moved?: {
    element: Course | OfferedCourseData
    newIndex: number
    oldIndex: number
  }
  removed?: {
    element: Course | OfferedCourseData
    oldIndex: number
  }
}

function handleChangeTableOne(event: ChangeEvent, addItem?: OfferedCourseData) {
  console.log(event, 'table1')
  //Add event
  if (event.added && addItem) {
    //Convert offeredCourseData to Course
    const convertedItem = coursesStore.courses.find(
      (item) => item.moduleCode === addItem.Course.moduleCode,
    )
    if (convertedItem && event.added.newIndex) {
      //Insert converted item into tableOne
      handlePuttingBackLogic(convertedItem)
      tableOne.splice(event.added.newIndex, 0, convertedItem)
    }
    //Remove event
  } else if (
    event.removed !== undefined &&
    event.removed.oldIndex !== undefined
  ) {
    tableOne.splice(event.removed.oldIndex, 1)
  }
}

function handleChangeTableTwo(event: ChangeEvent, addItem?: Course) {
  console.log(event, 'table2')
  //Add event
  if (event.added && addItem) {
    //Insert new offeredCourseData into tableTwo
    if (!handlePuttingInAgainLogic(addItem)) {
      offeredCoursesArray.value.splice(event.added.newIndex, 0, {
        Course: {
          lecturers: addItem.lecturers,
          moduleCode: addItem.moduleCode,
          title: addItem.title,
        },
        appointments: { dates: [], type: 'weekly' },
        extraInfo: null,
        for: [],
        maxParticipants: null,
        minParticipants: 0,
      })
      console.log(offeredCoursesArray.value)
    }
    //Remove event
  } else if (
    event.removed !== undefined &&
    event.removed.oldIndex !== undefined
  ) {
    offeredCoursesArray.value.splice(event.removed.oldIndex, 1)
  }
  console.log(offeredCoursesArray.value)
}

function getModuleCode(item: OfferedCourseData) {
  return item.Course.moduleCode
}
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12" md="6">
        {{ t('available-courses') }}
        <VDivider opacity="0" thickness="15px" />
        <div class="off-course">
          <Draggable
            :list="tableOne"
            class="list-group"
            group="courses"
            item-key="moduleCode"
            @change="handleChangeTableOne($event, $event.added?.element)"
          >
            <template #item="{ element }">
              <div class="list-group-item">
                {{ element.title.en }}
              </div>
            </template>
          </Draggable>
        </div>
      </VCol>
      <VCol cols="12" md="6">
        {{ t('offered-courses') }}
        <VDivider opacity="0" thickness="15px" />
        <div class="off-course">
          <Draggable
            :item-key="getModuleCode"
            :list="offeredCoursesArray"
            class="list-group"
            group="courses"
            @change="handleChangeTableTwo($event, $event.added?.element)"
          >
            <template #item="{ element }">
              <div class="list-group-item">
                <div>
                  {{
                    locale === 'en'
                      ? element.Course.title.en
                      : element.Course.title.de
                  }}
                  <!--TODO: The rest of the fields-->
                </div>
              </div>
            </template>
          </Draggable>
        </div>
      </VCol>
    </VRow>
    <!--<EditOfferedCourse
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
    />-->
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
  max-height: 40em;
  overflow-y: auto;
}
</style>
