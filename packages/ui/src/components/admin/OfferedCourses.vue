<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'
import {
  VCard,
  VCardText,
  VCardTitle,
  VCol,
  VDivider,
  VIcon,
  VRow,
} from 'vuetify/components'

import type { OfferedCourseData } from './types'

const offeredCoursesArray = defineModel<OfferedCourseData[]>({ required: true })

const coursesStore = useAdminCoursesStore()
const { locale, t } = useI18n()

const tableOne: Course[] = reactive([...coursesStore.courses])

const removeStore = ref<OfferedCourseData[]>([])

/*Following code handles the logic for drag and drop */
function handlePuttingBackLogic(subject: Course) {
  //Retrieve the data from the shared object
  const offeredCourseData = offeredCoursesArray.value.filter(
    (course) => course.moduleCode === subject.moduleCode,
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

function handlePuttingInAgainLogic(subject: Course) {
  //Try to retrieve data from remove store
  const offeredCourseData = removeStore.value.filter(
    (data) => data.moduleCode === subject.moduleCode,
  )
  //Remove data from remove store
  removeStore.value = removeStore.value.filter(
    (data) => data.moduleCode !== subject.moduleCode,
  )
  //Return retrieved object
  const retrievedObject = offeredCourseData.find(
    (data) => data.Course.moduleCode === subject.moduleCode,
  )
  return retrievedObject
}

function getDisplayDate(date: Date) {
  return date.toLocaleString('en-GB').replaceAll('/', '.')
}

const editOfferedCourse = ref<number>(-1)

function getModuleCode(item: OfferedCourseData) {
  return item.Course.moduleCode
}

function convertToOfferedCourseData(course: Course) {
  const removeStoreData = handlePuttingInAgainLogic(course)
  if (removeStoreData === undefined) {
    const convertedItem = {
      Course: {
        lecturers: course.lecturers,
        moduleCode: course.moduleCode,
        title: course.title,
      },
      appointments: { dates: [], type: 'weekly' },
      extraInfo: null,
      for: [],
      maxParticipants: null,
      minParticipants: 0,
    }
    return convertedItem
  } else if (removeStoreData !== undefined) {
    return removeStoreData
  }
}

function convertToCourse(offeredCourse: OfferedCourseData) {
  const convertedItem = coursesStore.courses.find(
    (item) => item.moduleCode === offeredCourse.Course.moduleCode,
  )
  if (convertedItem !== undefined) {
    handlePuttingBackLogic(convertedItem)
    return convertedItem
  }
  console.log('no matching course object found')
}

function getTypeKey(type: string) {
  switch (type) {
    case 'weekly':
      return 'types.weekly'
    case 'block':
      return 'types.block'
    default:
      return 'types.irregular'
  }
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
            :clone="convertToOfferedCourseData"
            :list="tableOne"
            class="list-group draggable-container"
            ghost-class="ghost"
            group="courses"
            item-key="moduleCode"
            force-fallback
          >
            <template #item="{ element }">
              <div class="list-group-item">
                <VCard
                  :title="locale === 'de' ? element.title.de : element.title.en"
                  class="hoverable-card"
                  color="rgb(var(--v-theme-secondary))"
                  height="50"
                  rounded="0"
                  hover
                />
                <VDivider opacity="0" thickness="15px" />
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
            :clone="convertToCourse"
            :item-key="getModuleCode"
            :list="offeredCoursesArray"
            class="list-group"
            ghost-class="ghost"
            group="courses"
          >
            <template #item="{ element, index }">
              <div class="list-group-item">
                <VCard
                  class="hoverable-card"
                  color="rgb(var(--v-theme-secondary))"
                  rounded="0"
                  hover
                >
                  <VCardTitle>
                    {{
                      locale === 'de'
                        ? element.Course.title.de
                        : element.Course.title.en
                    }}
                    <VIcon
                      class="pencil-icon"
                      size="20"
                      @click="editOfferedCourse = index"
                    >
                      mdi-pencil
                    </VIcon>
                  </VCardTitle>
                  <VCardText>
                    <div>
                      {{ t('type') }}:
                      {{ t(getTypeKey(element.appointments.type)) }}
                    </div>
                    <div
                      v-for="(timespan, appointIndex) in element.appointments
                        .dates"
                      :key="appointIndex"
                    >
                      <div>
                        <strong>{{ t('from') }}:</strong>
                        {{ getDisplayDate(timespan.from) }}
                        <strong>{{ t('to') }}:</strong>
                        {{ getDisplayDate(timespan.to) }}
                      </div>
                    </div>
                    <div>
                      {{ t('min-participants') }}: {{ element.minParticipants }}
                      <template v-if="element.maxParticipants">
                        {{ t('max-participants') }}:
                        {{ element.maxParticipants }}
                      </template>
                    </div>
                    <div v-if="element.extraInfo">
                      {{ t('extra-info') }}: {{ element.extraInfo }}
                    </div>
                  </VCardText>
                </VCard>
                <VDivider opacity="0" thickness="15px" />
              </div>
            </template>
          </Draggable>
        </div>
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
  types:
    weekly: Weekly
    block: Block Event
    irregular: Irregular
  from: From
  to: To
  min-participants: Min participants
  max-participants: Max participants
  extra-info: Extra information
de:
  available-courses: Verfügbare Kurse
  offered-courses: Angebote Kurse
  type: Typ
  types:
    weekly: Wöchentlich
    block: Blockveranstaltung
    irregular: Unregelmäßig
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

.pencil-icon {
  cursor: pointer;
}

.dateId-box {
  padding-top: $paddingValue;
}

.off-course {
  max-height: 40em;
  overflow-y: auto;
}

.draggable-item:hover {
  cursor: pointer;
  background-color: $backgroundColor;
}

.ghost {
  opacity: 0.5;
  color: $borderColor;
}
</style>
