<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import {
  VCard,
  VCardText,
  VCol,
  VDialog,
  VRow,
  VTextField,
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
      :title="`Edit - ${formData.Course.title.en}`"
      prepend-icon="mdi-pencil"
    >
      <VCardText>
        <VRow dense>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="formData.minParticipants"
              label="Minimum participants"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="formData.maxParticipants"
              label="Maximum participants"
              type="number"
              required
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="formData.moodleCourse"
              label="Moodle course link"
              type="url"
              required
            />
          </VCol>
          <VCol cols="12">
            <VIcon>mdi-calendar</VIcon>
            <strong>Appointment(s)</strong>
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
                    label="from"
                    type="datetime-local"
                    hide-details
                    required
                  />
                </VCol>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="interval.to"
                    label="to"
                    type="datetime-local"
                    hide-details
                    required
                  />
                </VCol>
              </VRow>
            </div>
            <br />
            <VBtn @click="addDate"> Add Date </VBtn>
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="formData.for"
              hint="E.g. IN, WIN, TI,"
              label="For fields of study"
              required
            />
          </VCol>
          <VCol>
            <VRadioGroup v-model="formData.appointments.type" inline>
              <VRadio label="weekly" value="weekly" />
              <VRadio label="block" value="block" />
              <VRadio label="irregular" value="irregular" />
            </VRadioGroup>
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="formData.extraInfo"
              label="Extra information"
              required
            />
          </VCol>
        </VRow>
        <small class="text-caption text-medium-emphasis"
          >*separate multiple elements with comma</small
        >
      </VCardText>
      <VDivider />
      <template #actions>
        <VBtn text="Cancel" @click="$emit('abort')" />
        <VBtn class="ms-auto" text="Save" @click="submit" />
      </template>
    </VCard>
  </VDialog>
</template>
