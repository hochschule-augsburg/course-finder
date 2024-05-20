<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { fieldsOfStudyAbbrMap } from '@/helper/fieldsOfStudy'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { assign } from 'lodash-es'
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
const editOfferedCourse = ref<number>(-1)

const removeStore = ref<OfferedCourseData[]>([])

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

function handlePuttingInAgainLogic(
  subject: Course,
): OfferedCourseData | undefined {
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
    (data) => data.moduleCode === subject.moduleCode,
  )
  return retrievedObject
}

function convertToOfferedCourseData(course: Course): OfferedCourseData {
  const removeStoreData = handlePuttingInAgainLogic(course)
  if (removeStoreData === undefined) {
    return {
      Course: {
        lecturers: course.lecturers,
        title: course.title,
      },
      appointments: { dates: [], type: 'weekly' },
      extraInfo: null,
      for: [],
      maxParticipants: null,
      minParticipants: 0,
      moduleCode: course.moduleCode,
      moodleCourse: null,
    }
  }
  return removeStoreData
}

function convertToCourse(offeredCourse: OfferedCourseData): Course | undefined {
  const convertedItem = coursesStore.courses.find(
    (item) => item.moduleCode === offeredCourse.moduleCode,
  )
  if (convertedItem !== undefined) {
    handlePuttingBackLogic(convertedItem)
    return convertedItem
  }
  console.log('no matching course object found')
}

function displayFieldsOfStudy(fields: string[]) {
  return fields.map((e: string): string => fieldsOfStudyAbbrMap[e]).join(', ')
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
            :list="offeredCoursesArray"
            class="list-group"
            ghost-class="ghost"
            group="courses"
            item-key="moduleCode"
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
                      {{ t(`types.${element.appointments.type}`) }}
                    </div>
                    <div
                      v-for="(timespan, appointIndex) in element.appointments
                        .dates"
                      :key="appointIndex"
                    >
                      <div>
                        <strong>{{ t('from') }}:</strong>
                        {{
                          //TODO
                          timespan.from.toLocaleString(locale, {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        }}
                        <strong>{{ t('to') }}:</strong>
                        {{
                          timespan.to.toLocaleString(locale, {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        }}
                      </div>
                    </div>
                    <div>
                      {{ t('min-participants') }}: {{ element.minParticipants }}
                      <template v-if="element.maxParticipants">
                        {{ t('max-participants') }}:
                        {{ element.maxParticipants }}
                      </template>
                    </div>
                    <div v-if="element.for?.length">
                      {{ t('for-fields-of-study') }}:
                      {{ displayFieldsOfStudy(element.for) }}
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
          offeredCoursesArray[editOfferedCourse ?? -1] = assign(
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
  for-fields-of-study: For fields of study
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
  for-fields-of-study: Für Studienfelder
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
