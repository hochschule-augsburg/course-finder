<script lang="ts" setup>
import type { AdminOfferedCourse } from '@/stores/admin/AdminCoursesStore'
import type { CourseAppointmentsJson } from '@workspace/api/src/prisma/PrismaTypes'

import {
  abbrFieldsOfStudyMap,
  fieldsOfStudy,
  fieldsOfStudyAbbrMap,
} from '@/helper/fieldsOfStudy'
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
  if (!props.offeredCourse) {
    formData.value = undefined
    return
  }
  formData.value = {
    ...props.offeredCourse,
    appointments: {
      dates: props.offeredCourse?.appointments.dates.map((e) => ({
        from: e.from.toISOString(),
        to: e.to.toISOString(),
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
}

function addDate() {
  const last = formData.value?.appointments.dates.at(-1)?.to ?? new Date()
  formData.value?.appointments.dates.push({
    from: last.toString(),
    to: last.toString(),
  })
}

function removeDate() {
  formData.value?.appointments.dates.pop()
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
      prepend-icon="mdi-pencil"
    >
      <VCardText>
        <VRow dense>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="formData.minParticipants"
              :label="t('minimum-participants')"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="formData.maxParticipants"
              :label="t('maximum-participants')"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="formData.moodleCourse"
              :label="t('moodle-course-link')"
              type="url"
              required
            />
          </VCol>
          <VCol cols="12">
            <VIcon>mdi-calendar</VIcon>
            <strong>{{ t('appointments') }}</strong>
            <div
              v-for="(interval, index) in formData.appointments.dates"
              :key="index"
            >
              <div class="dateId-box" style="display: flex">
                <VIcon @click="removeDate"> mdi-trash-can-outline </VIcon>
              </div>
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
            <br />
            <VBtn @click="addDate"> {{ t('add-date') }} </VBtn>
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect
              v-model="formData.for"
              :items="fieldsOfStudy.map((e) => e[0])"
              :label="t('for-fields-of-study')"
              chips
              multiple
              required
            >
              <template #item="{ props: itemProps, item }">
                <VListItem
                  v-bind="itemProps"
                  :subtitle="fieldsOfStudyAbbrMap[item.title]"
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
        <VBtn :text="t('global.cancel')" @click="$emit('cancel')" />
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
</i18n>
