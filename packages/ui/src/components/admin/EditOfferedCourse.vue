<script lang="ts" setup>
import type { AdminOfferedCourse } from '@/stores/admin/AdminCoursesStore'
import type { CourseAppointmentsJson } from '@workspace/api/src/prisma/PrismaTypes'

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
        from: addHours(new Date(e.from), 2).toISOString().slice(0, 16),
        to: addHours(new Date(e.to), 2).toISOString().slice(0, 16),
      })),
      type: props.offeredCourse?.appointments.type,
    },
    for: props.offeredCourse.for.map((e) => fieldsOfStudyAbbrMap[e] ?? e),
  }
})

//TODO: Better way to do this?
function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

const { locale, t } = useI18n()

function submit() {
  if (!formData.value) {
    return
  }
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
  const last = formData.value?.appointments.dates.at(-1)?.to ?? new Date()
  formData.value?.appointments.dates.push({
    from: '',
    to: '',
  })
  datesArray.value.push({ endTime: '', startTime: '', weekday: '' })
  console.log(datesArray.value)
}

function removeDate() {
  formData.value?.appointments.dates.pop()
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

    const appointmentDate = setDay(today, dayIndex, { weekStartsOn: 1 })
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
  } else {
    console.log('event fired but data not completed')
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
      const weekday = fromDate.toLocaleDateString('en-US', { weekday: 'long' })

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
          <VCol cols="6">
            <VTextField
              v-model="formData.moodleCourse"
              :label="t('moodle-course-link')"
              type="url"
              required
            />
          </VCol>
          <VCol cols="6">
            <VSwitch
              v-model="formData.externalRegistration"
              :label="t('external-registration')"
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
          <VCol>
            <VRadioGroup v-model="formData.appointments.type" inline>
              <VRadio :label="t('weekly')" value="weekly" />
              <VRadio :label="t('block')" value="block" />
              <VRadio :label="t('irregular')" value="irregular" />
            </VRadioGroup>
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
                <div class="dateId-box" style="display: flex">
                  <VIcon :icon="mdiTrashCanOutline" @click="removeDate" />
                </div>
                <VRow>
                  <VCol cols="12" sm="4">
                    <VSelect
                      v-model="interval.weekday"
                      :items="[
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                        'Sunday',
                      ]"
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
                      @update:focused="updateWeeklyAppointment(index)"
                    />
                  </VCol>
                  <VCol cols="12" sm="4">
                    <VTextField
                      v-model="interval.endTime"
                      :label="t('to')"
                      type="time"
                      hide-details
                      required
                      @update:focused="updateWeeklyAppointment(index)"
                    />
                  </VCol>
                </VRow>
              </div>
            </div>
            <div v-else>
              <div
                v-for="(interval, index) in formData.appointments.dates"
                :key="index"
              >
                <div class="dateId-box" style="display: flex">
                  <VIcon :icon="mdiTrashCanOutline" @click="removeDate" />
                </div>
                {{ console.log(datesArray) }}
                <VRow>
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
                    />
                  </VCol>
                </VRow>
              </div>
            </div>
            <br />
            <VBtn @click="addDate"> {{ t('add-date') }} </VBtn>
          </VCol>
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
