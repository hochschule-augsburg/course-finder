<script lang="ts" setup>
import type { AdminOfferedCourse } from '@/stores/admin/AdminCoursesStore'
import type { CourseAppointmentsJson } from '@workspace/api/src/prisma/PrismaTypes'

import { getLocalISOString } from '@/helper/LocaleDateFormat'
import {
  abbrFieldsOfStudyMap,
  fieldsOfStudy,
  fieldsOfStudyAbbrMap,
} from '@/helper/enums/fieldsOfStudy'
import { mdiCalendar, mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import { format, setDay, startOfWeek } from 'date-fns'
import { cloneDeep } from 'lodash-es'
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardText,
  VCol,
  VDialog,
  VDivider,
  VIcon,
  VListItem,
  VRadio,
  VRadioGroup,
  VRow,
  VSelect,
  VSwitch,
  VTextField,
  VTextarea,
} from 'vuetify/components'

const props = defineProps<{
  enableDelete?: boolean
  offeredCourse?: AdminOfferedCourse
  visible?: boolean
}>()
const emits = defineEmits<{
  cancel: []
  submit: [FormData: AdminOfferedCourse | undefined]
}>()

const formData = ref<
  { appointments: CourseAppointmentsJson<string> } & Omit<
    AdminOfferedCourse,
    'appointments'
  >
>()

watchEffect(() => {
  if (!props.offeredCourse || !props.visible) {
    formData.value = undefined
    return
  }
  formData.value = {
    ...cloneDeep(props.offeredCourse),
    appointments: {
      dates: props.offeredCourse?.appointments.dates.map((e) => ({
        from: getLocalISOString(e.from),
        to: getLocalISOString(e.to),
      })),
      type: props.offeredCourse?.appointments.type,
    },
    for: props.offeredCourse.for.map((e) => fieldsOfStudyAbbrMap[e] ?? e),
  }
})

const { locale, t } = useI18n()

function submit() {
  if (!formData.value) {
    return
  }
  formData.value.appointments.dates = formData.value.appointments.dates.filter(
    (data) => data !== undefined,
  )
  emits('submit', {
    ...formData.value,
    appointments: {
      ...formData.value.appointments,
      dates: formData.value.appointments.dates.map((e) => ({
        from: new Date(e.from),
        to: new Date(e.to),
      })),
    },
    for: formData.value.for.map((e) => abbrFieldsOfStudyMap[e] ?? e),
  })
  datesArray.value = []
}

function cancel() {
  emits('cancel')
  datesArray.value = []
}

function addDate() {
  const lastTo = formData.value?.appointments.dates.at(-1)?.to ?? new Date()

  formData.value?.appointments.dates.push({
    from: getLocalISOString(lastTo),
    to: getLocalISOString(lastTo),
  })
}

function addDateWeekly() {
  const last = datesArray.value.at(-1)
  if (last) {
    datesArray.value.push({
      endTime: last.endTime,
      startTime: last.startTime,
      weekday: last.weekday,
    })
  } else {
    datesArray.value.push({
      endTime: '00:00',
      startTime: '00:00',
      weekday: '',
    })
  }
}

function removeDate(index: number) {
  formData.value?.appointments.dates.splice(index, 1)
}

function removeDateWeekly(index: number) {
  const dateArrayObject = datesArray.value.at(index)

  if (!dateArrayObject || !formData.value?.appointments?.dates) {
    return
  }

  const { endTime, startTime, weekday } = dateArrayObject

  formData.value.appointments.dates = formData.value.appointments.dates.filter(
    (data) => {
      const dateFrom = new Date(data.from)
      const dateTo = new Date(data.to)

      const dayOfWeek = dateFrom.toLocaleDateString('en-US', {
        weekday: 'long',
      })

      const fromTime = dateFrom.toTimeString().split(' ')[0].slice(0, -3) // "HH:MM"
      const toTime = dateTo.toTimeString().split(' ')[0].slice(0, -3)
      console.log(dayOfWeek, weekday, fromTime, startTime, toTime, endTime)
      return !(
        dayOfWeek === weekday &&
        fromTime === startTime &&
        toTime === endTime
      )
    },
  )
  datesArray.value.splice(index, 1)
}

function updateWeeklyAppointment(index: number) {
  const dateObject = datesArray.value.at(index)
  if (
    dateObject &&
    dateObject.weekday &&
    dateObject.startTime &&
    dateObject.endTime
  ) {
    const today = startOfWeek(new Date(), { weekStartsOn: 1 })
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ]
    const dayIndex = daysOfWeek.indexOf(dateObject.weekday) + 1

    const appointmentDate = setDay(today, dayIndex)
    const formattedDate = format(appointmentDate, 'yyyy-MM-dd')
    const fromTime = `${formattedDate}T${dateObject.startTime}`
    const toTime = `${formattedDate}T${dateObject.endTime}`

    if (formData.value) {
      formData.value.appointments.dates[index] = {
        from: fromTime,
        to: toTime,
      }
      console.log({ from: fromTime, to: toTime })
    }
  }
}

const datesArray = ref<
  Array<{
    endTime: string
    startTime: string
    weekday: string
  }>
>([])

function initializeDatesArray(dates: Array<{ from: string; to: string }>) {
  dates.forEach(function (date) {
    const fromDate = new Date(date.from)
    const toDate = new Date(date.to)

    if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
      const startTime = fromDate.toTimeString().split(' ')[0].slice(0, -3)
      const endTime = toDate.toTimeString().split(' ')[0].slice(0, -3)
      const weekday = fromDate.toLocaleDateString('en-US', {
        weekday: 'long',
      })

      const dateEntry = {
        endTime: endTime,
        startTime: startTime,
        weekday: weekday,
      }

      const isDuplicate = datesArray.value.some(
        (item) =>
          item.endTime === dateEntry.endTime &&
          item.startTime === dateEntry.startTime &&
          item.weekday === dateEntry.weekday,
      )

      if (!isDuplicate) {
        datesArray.value.push(dateEntry)
      }
    }
  })
  return datesArray.value
}

const weekdayItems = [
  { value: 'Monday', weekday: t('monday') },
  { value: 'Tuesday', weekday: t('tuesday') },
  { value: 'Wednesday', weekday: t('wednesday') },
  { value: 'Thursday', weekday: t('thursday') },
  { value: 'Friday', weekday: t('friday') },
  { value: 'Saturday', weekday: t('saturday') },
  { value: 'Sunday', weekday: t('sunday') },
]
</script>

<template>
  <VDialog
    :model-value="visible"
    max-width="1000"
    min-width="auto"
    transition="false"
    @update:model-value="$emit('cancel')"
  >
    <VCard
      v-if="formData"
      :title="
        t('title', [
          locale === 'en'
            ? offeredCourse?.Course.title.en
            : offeredCourse?.Course.title.de,
        ])
      "
      :prepend-icon="mdiPencil"
    >
      <VCardText>
        <VRow dense>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="formData.minParticipants"
              :label="t('minimum-participants')"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="formData.maxParticipants"
              :label="t('maximum-participants')"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect
              v-model="formData.for"
              :items="fieldsOfStudy.map((e) => e[1])"
              :label="t('for-fields-of-study')"
              chips
              multiple
              required
            >
              <template #item="{ props: itemProps, item }">
                <VListItem
                  v-bind="itemProps"
                  :subtitle="abbrFieldsOfStudyMap[item.title]"
                />
              </template>
            </VSelect>
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="formData.moodleCourse"
              :label="t('moodle-course-link')"
              type="url"
              required
            />
          </VCol>
          <VCol>
            <VRadioGroup v-model="formData.appointments.type" inline>
              <VRadio :label="t('weekly')" value="weekly" />
              <VRadio :label="t('block')" value="block" />
              <VRadio :label="t('irregular')" value="irregular" />
            </VRadioGroup>
          </VCol>
          <VCol cols="6">
            <VSwitch
              v-model="formData.externalRegistration"
              :label="t('external-registration')"
            />
          </VCol>
          <VCol cols="12">
            <VIcon :icon="mdiCalendar" />
            <strong>{{ t('appointments') }}</strong>
            <div v-if="formData.appointments.type === 'weekly'">
              <div
                v-for="(interval, index) in initializeDatesArray(
                  formData.appointments.dates,
                )"
                :key="index"
              >
                <VRow dense>
                  <VCol cols="12" sm="4">
                    <VSelect
                      v-model="interval.weekday"
                      :items="weekdayItems"
                      hide-details="auto"
                      item-title="weekday"
                      item-value="value"
                      label="Weekday"
                      @update:model-value="updateWeeklyAppointment(index)"
                    />
                  </VCol>
                  <VCol cols="12" sm="4">
                    <VTextField
                      v-model="interval.startTime"
                      :label="t('from')"
                      type="time"
                      hide-details
                      required
                      @update:model-value="updateWeeklyAppointment(index)"
                    />
                  </VCol>
                  <VCol cols="12" sm="4">
                    <VTextField
                      v-model="interval.endTime"
                      :label="t('to')"
                      type="time"
                      hide-details
                      required
                      @update:model-value="updateWeeklyAppointment(index)"
                    >
                      <template #append>
                        <div class="dateId-box">
                          <VIcon
                            :icon="mdiTrashCanOutline"
                            size="30"
                            @click="removeDateWeekly(index)"
                          />
                        </div>
                      </template>
                    </VTextField>
                  </VCol>
                </VRow>
                <VDivider :thickness="2" class="mt-3 mb-3 hidden-sm-and-up" />
              </div>
              <br />
              <VBtn @click="addDateWeekly"> {{ t('add-date') }} </VBtn>
              <br />
            </div>
            <div v-else>
              <div
                v-for="(interval, index) in formData.appointments.dates"
                :key="index"
              >
                <div v-if="interval !== undefined">
                  <VRow dense>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="interval.from"
                        :label="t('from')"
                        type="datetime-local"
                        hide-details
                        required
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="interval.to"
                        :label="t('to')"
                        type="datetime-local"
                        hide-details
                        required
                      >
                        <template #append>
                          <div class="dateId-box">
                            <VIcon
                              :icon="mdiTrashCanOutline"
                              size="30"
                              @click="removeDate(index)"
                            />
                          </div>
                        </template>
                      </VTextField>
                    </VCol>
                  </VRow>
                </div>
              </div>
              <br />
              <VBtn @click="addDate"> {{ t('add-date') }} </VBtn>
            </div>
          </VCol>
          <div><br /></div>
          <VCol cols="12">
            <VTextarea
              v-model="formData.extraInfo"
              :label="t('extra-information')"
              required
            />
          </VCol>
        </VRow>
        <small class="text-caption text-medium-emphasis"
          >*{{ t('multiple-elements-separation') }}</small
        >
      </VCardText>
      <VDivider />
      <template #actions>
        <VBtn :text="t('global.cancel')" @click="cancel" />
        <VSpacer />
        <VBtn
          v-if="enableDelete"
          :text="t('global.delete')"
          @click="$emit('submit', undefined)"
        />
        <VBtn
          :disabled="!formData.moduleCode"
          :text="t('global.save')"
          @click="submit"
        />
      </template>
    </VCard>
  </VDialog>
</template>

<i18n lang="yaml">
en:
  title: 'Edit - {0}'
  minimum-participants: Minimum participants
  maximum-participants: Maximum participants
  moodle-course-link: Moodle course link
  monday: 'Monday'
  tuesday: 'Tuesday'
  wednesday: 'Wednesday'
  thursday: 'Thursday'
  friday: 'Friday'
  saturday: 'Saturday'
  sunday: 'Sunday'
  appointments: Appointment(s)
  from: From
  to: To
  add-date: Add Date
  for-fields-of-study: For fields of study
  fields-of-study-hint: E.g. IN, WIN, TI,
  weekly: weekly
  block: block
  irregular: irregular
  extra-information: Extra information
  multiple-elements-separation: '*separate multiple elements with comma'
  external-registration: External registration
de:
  title: 'Bearbeiten - {0}'
  minimum-participants: Mindestteilnehmer
  maximum-participants: Maximale Teilnehmer
  monday: 'Montag'
  tuesday: 'Dienstag'
  wednesday: 'Mittwoch'
  thursday: 'Donnerstag'
  friday: 'Freitag'
  saturday: 'Samstag'
  sunday: 'Sonntag'
  moodle-course-link: Moodle-Kurslink
  appointments: Termin(e)
  from: Von
  to: Bis
  add-date: Datum hinzufügen
  for-fields-of-study: Für Studienfelder
  fields-of-study-hint: Z.B. IN, WIN, TI,
  weekly: wöchentlich
  block: Block
  irregular: Unregelmäßig
  extra-information: Zusätzliche Informationen
  multiple-elements-separation: '*Trennen Sie mehrere Elemente mit Kommas'
  external-registration: Externe Anmeldung
</i18n>
