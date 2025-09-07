<script lang="ts" setup>
import type { CourseAppointmentsJson } from '@workspace/api/src/prisma/PrismaTypes'

import { mdiCalendar, mdiPencil, mdiTrashCanOutline } from '@mdi/js'
import { format, setDay, startOfWeek } from 'date-fns'
import { cloneDeep, isNumber } from 'lodash-es'
import { ref, watchEffect } from 'vue'
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
  VTextarea,
  VTextField,
} from 'vuetify/components'

import type { AdminOfferedCourse } from '@/stores/admin/AdminCoursesStore'

import {
  abbrFieldsOfStudyMap,
  fieldsOfStudy,
  fieldsOfStudyAbbrMap,
} from '@/helper/enums/fieldsOfStudy'
import { getLocalISOString } from '@/helper/LocaleDateFormat'

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
  Omit<AdminOfferedCourse, 'appointments'> & {
    appointments: CourseAppointmentsJson<string>
  }
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

function cancel() {
  emits('cancel')
  datesArray.value = []
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

      const dayOfWeek = dateFrom.toLocaleDateString('en-GB', {
        weekday: 'long',
      })

      const fromTime = dateFrom.toTimeString().split(' ')[0].slice(0, -3) // "HH:MM"
      const toTime = dateTo.toTimeString().split(' ')[0].slice(0, -3)
      return !(
        dayOfWeek === weekday &&
        fromTime === startTime &&
        toTime === endTime
      )
    },
  )
  datesArray.value.splice(index, 1)
}

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
      const weekday = fromDate.toLocaleDateString('en-GB', {
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
  { value: 'Monday', weekday: 'Montag' },
  { value: 'Tuesday', weekday: 'Dienstag' },
  { value: 'Wednesday', weekday: 'Mittwoch' },
  { value: 'Thursday', weekday: 'Donnerstag' },
  { value: 'Friday', weekday: 'Freitag' },
  { value: 'Saturday', weekday: 'Samstag' },
  { value: 'Sunday', weekday: 'Sonntag' },
]

function validate(): boolean {
  // minParticipants required, of type number, min 0
  if (
    !isNumber(formData.value?.minParticipants?.valueOf()) ||
    formData.value?.minParticipants?.valueOf() < 0
  ) {
    return true
  }
  // when maxParticipants defined, it must be of type number and greater than minParticipants
  if (
    formData.value?.maxParticipants?.valueOf() !== undefined &&
    (!isNumber(formData.value?.maxParticipants?.valueOf()) ||
      formData.value?.minParticipants?.valueOf() >
        formData.value?.maxParticipants?.valueOf())
  ) {
    return true
  }
  return false
}

const minParticipantsRules = [
  (i: number) => isNumber(i.valueOf()) || 'Bitte eine Zahl eingeben',
  (i: number) => i.valueOf() >= 0 || 'Teilnehmerzahl mindestens 0',
]

function forAllStudy() {
  if (!formData.value) {
    return
  }
  formData.value.for = Object.values(fieldsOfStudy).map((e) => e.abbr)
}
function forBaStudy() {
  if (!formData.value) {
    return
  }
  formData.value.for = Object.entries(fieldsOfStudy)
    .filter((e) => e[1].degree === 'Bachelor')
    .map((e) => e[1].abbr)
}
function forMaStudy() {
  if (!formData.value) {
    return
  }
  formData.value.for = Object.entries(fieldsOfStudy)
    .filter((e) => e[1].degree === 'Master')
    .map((e) => e[1].abbr)
    .filter((e) => e !== 'IMS')
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
      :prepend-icon="mdiPencil"
      :title="`Bearbeiten - ${offeredCourse?.Course.title.de}`"
    >
      <VCardText>
        <VRow dense>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="formData.minParticipants"
              :rules="minParticipantsRules"
              hide-details="auto"
              label="Mindestteilnehmer"
              type="number"
              validate-on="input"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="formData.maxParticipants"
              label="Maximale Teilnehmer"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect
              v-model="formData.for"
              :items="Object.keys(abbrFieldsOfStudyMap)"
              label="Für Studienfelder"
              style="height: 3.5rem"
              chips
              multiple
              required
            >
              <template #append>
                <div class="inner-btn">
                  <VBtn @click.stop="forBaStudy">BA</VBtn>
                  <VBtn @click.stop="forMaStudy">MA</VBtn>
                  <VBtn @click.stop="forAllStudy">All</VBtn>
                </div>
              </template>
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
              label="Moodle-Kurslink"
              type="url"
              required
            />
          </VCol>
          <VCol>
            <VRadioGroup v-model="formData.appointments.type" inline>
              <VRadio label="wöchentlich" value="weekly" />
              <VRadio label="Block" value="block" />
              <VRadio label="Unregelmäßig" value="irregular" />
            </VRadioGroup>
          </VCol>
          <VCol cols="3">
            <VSwitch
              v-model="formData.externalRegistration"
              label="Externe Anmeldung"
            />
          </VCol>
          <VCol cols="3">
            <VSwitch
              v-model="formData.hideMinParticipants"
              label="Mindestteilnehmerzahl verbergen"
            />
          </VCol>
          <VCol cols="12">
            <VIcon :icon="mdiCalendar" />
            <strong>Termin(e)</strong>
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
                      label="Wochentag"
                      @update:model-value="updateWeeklyAppointment(index)"
                    />
                  </VCol>
                  <VCol cols="12" sm="4">
                    <VTextField
                      v-model="interval.startTime"
                      label="Von"
                      type="time"
                      hide-details
                      required
                      @update:model-value="updateWeeklyAppointment(index)"
                    />
                  </VCol>
                  <VCol cols="12" sm="4">
                    <VTextField
                      v-model="interval.endTime"
                      label="Bis"
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
              <VBtn @click="addDateWeekly"> Datum hinzufügen </VBtn>
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
                        label="Von"
                        type="datetime-local"
                        hide-details
                        required
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="interval.to"
                        label="Bis"
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
              <VBtn @click="addDate"> Datum hinzufügen </VBtn>
            </div>
          </VCol>
          <div><br /></div>
          <VCol cols="12">
            <VTextarea
              v-model="formData.extraInfo"
              label="Zusätzliche Informationen"
              required
            />
          </VCol>
        </VRow>
        <small class="text-caption text-medium-emphasis"
          >*Trennen Sie mehrere Elemente mit Kommas</small
        >
        <br />
        <small
          v-if="
            formData.maxParticipants?.valueOf() !== undefined &&
            formData.maxParticipants?.valueOf() <
              formData.minParticipants?.valueOf()
          "
          class="text-caption"
          style="color: rgb(var(--v-theme-primary))"
        >
          Maximale Teilnehmerzahl muss größer sein als Mindestteilnehmerzahl
        </small>
      </VCardText>
      <VDivider />
      <template #actions>
        <VBtn text="Abbrechen" @click="cancel" />
        <VSpacer />
        <VBtn
          v-if="enableDelete"
          text="Löschen"
          @click="$emit('submit', undefined)"
        />
        <VBtn :disabled="validate()" text="Speichern" @click="submit" />
      </template>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.inner-btn {
  display: flex;
  align-items: flex-start;
  height: 100%;
  margin-left: -1rem;
  .v-btn {
    min-width: 1rem;
    width: 1rem;
    margin-left: var(--element-spacing-s);
  }
}
</style>
