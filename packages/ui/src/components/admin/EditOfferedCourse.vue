<script lang="ts" setup>
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
  VRadio,
  VRadioGroup,
  VRow,
  VTextField,
  VTextarea,
} from 'vuetify/components'

import type { OfferedCourseData } from './types'

const props = defineProps<{
  offeredCourse?: OfferedCourseData
  visible?: boolean
}>()
const emits = defineEmits<{
  abort: []
  submit: [FormData: OfferedCourseData]
}>()

const formData = ref<OfferedCourseData>()

watchEffect(() => {
  formData.value = Object.assign({}, props.offeredCourse)
})

const { locale, t } = useI18n()

function submit() {
  if (!formData.value) {
    return
  }
  emits('submit', formData.value)
}

function addDate() {
  const last = formData.value?.appointments.dates.at(-1)?.to ?? new Date()
  formData.value?.appointments.dates.push({
    from: last,
    to: last,
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
    @update:model-value="$emit('abort')"
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
            <VTextField
              v-model="formData.for"
              :hint="t('fields-of-study-hint')"
              :label="t('for-fields-of-study')"
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
        <VBtn :text="t('global.cancel')" @click="$emit('abort')" />
        <VBtn :text="t('global.save')" class="ms-auto" @click="submit" />
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
