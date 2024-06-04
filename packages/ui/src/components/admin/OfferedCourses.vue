<script setup lang="ts">
import type { Course } from '@/stores/admin/AdminCoursesStore'

import { fieldsOfStudyAbbrMap } from '@/helper/enums/fieldsOfStudy'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { trpc } from '@/trpc'
import { mdiInvoiceTextPlus, mdiMagnify, mdiPencil } from '@mdi/js'
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
  VTextField,
} from 'vuetify/components'

import type { OfferedCourseData } from './types'
const adminStore = useAdminCoursesStore()
const offeredCoursesArray = defineModel<OfferedCourseData[]>({ required: true })

const coursesStore = useAdminCoursesStore()
const { locale, t } = useI18n()

const tableOne: Course[] = reactive([...coursesStore.courses])
const editOfferedCourse = ref<number>(-1)

const removeStore = ref<OfferedCourseData[]>([])

const selectedSubject = ref<Course>(adminStore.courses[0])
const showModalForm = ref(false)
const onTheFly = ref(true)

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
  showModalForm.value = true
}

async function createSubject(subject: Course | undefined) {
  if (!subject) {
    return
  }
  try {
    const result = await trpc.admin.courses.create.mutate(subject)
    adminStore.courses.push(result)
    // Perf is okay
    adminStore.courses.sort((a, b) => a.moduleCode.localeCompare(b.moduleCode))
    offeredCoursesArray.value.push({
      Course: {
        lecturers: subject.lecturers,
        title: subject.title,
      },
      appointments: { dates: [], type: 'weekly' },
      externalRegistration: false,
      extraInfo: null,
      for: [],
      maxParticipants: null,
      minParticipants: 0,
      moduleCode: subject.moduleCode,
      moodleCourse: null,
    })
    showModalForm.value = false
  } catch (e) {
    console.log('Error creating Subject')
  }
}

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
      externalRegistration: false,
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

function filterCourse(course: Course) {
  return (
    !!course.title.de
      ?.toLowerCase()
      .includes(searchCourses.value.toLowerCase()) ||
    !!course.title.en?.toLowerCase().includes(searchCourses.value.toLowerCase())
  )
}
const searchCourses = ref('')

function filterOffered(course: OfferedCourseData) {
  return (
    !!course.Course.title.de
      ?.toLowerCase()
      .includes(searchOffered.value.toLowerCase()) ||
    !!course.Course.title.en
      ?.toLowerCase()
      .includes(searchOffered.value.toLowerCase())
  )
}
const searchOffered = ref('')
</script>

<template>
  <div>
    <VRow>
      <VCol cols="12" md="6">
        <h3>{{ t('available-courses') }}</h3>
        <VDivider opacity="0" thickness="15px" />
        <VTextField
          v-model="searchCourses"
          :label="t('global.search')"
          :prepend-inner-icon="mdiMagnify"
        />
        <div class="off-course">
          <Draggable
            :clone="convertToOfferedCourseData"
            :empty-insert-threshold="100"
            :list="tableOne"
            class="list-group draggable-container"
            ghost-class="ghost"
            group="courses"
            item-key="moduleCode"
            force-fallback
          >
            <template #item="{ element }">
              <div v-if="filterCourse(element)" class="list-group-item">
                <VCard
                  :title="locale === 'de' ? element.title.de : element.title.en"
                  class="hoverable-card"
                  color="secondary"
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
        <h3>
          {{ t('offered-courses') }}
          <VIcon
            v-tooltip="t('on-the-fly')"
            :icon="mdiInvoiceTextPlus"
            size="25"
            @click="openNewDialog"
          />
        </h3>
        <VDivider opacity="0" thickness="15px" />
        <VTextField
          v-model="searchOffered"
          :label="t('global.search')"
          :prepend-inner-icon="mdiMagnify"
        />
        <div class="off-course">
          <Draggable
            :clone="convertToCourse"
            :empty-insert-threshold="100"
            :list="offeredCoursesArray"
            class="list-group"
            ghost-class="ghost"
            group="courses"
            item-key="moduleCode"
            force-fallback
          >
            <template #item="{ element, index }">
              <div v-if="filterOffered(element)" class="list-group-item">
                <VCard
                  class="hoverable-card"
                  color="secondary"
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
                      :icon="mdiPencil"
                      class="pencil-icon"
                      size="20"
                      @click="editOfferedCourse = index"
                    />
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
                    <div v-if="element.externalRegistration">
                      {{ t('external-registration') }}
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
    <CourseDialog
      :on-the-fly="onTheFly"
      :selected-subject="selectedSubject"
      :visible="showModalForm"
      @cancel="showModalForm = false"
      @submit="createSubject"
    />
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
  on-the-fly: Create new offered course
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
  external-registration: External registration
de:
  on-the-fly: Neues Angebot erstellen
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
  external-registration: Externe Anmeldung
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
