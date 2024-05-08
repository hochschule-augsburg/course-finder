<script setup lang="ts">
import { reactive, ref } from 'vue'

interface offeredCourseData {
  appointments: {
    dates: Array<{ from: Date; to: Date }>
    type: 'block' | 'irregular' | 'weekly'
  }
  extraInfo: string
  for: string[]
  maxParticipants: number
  minParticipants: number
  moduleCode: string
  moodleCourse: string
}

const sharedObject = ref<offeredCourseData[]>([])

const newEnrollmentData = reactive({
  description: '',
  end: '',
  offeredCourses: [],
  start: '',
  title: '',
})

function createEnrollment() {
  sharedObject.value.forEach(function (offCou) {
    console.log(offCou)
  })

  sharedObject.value = []
}
</script>

<template>
  <VForm>
    <VContainer fluid>
      <VRow justify="center">
        <VCol cols="10">
          <h1>Create enrollment</h1>
          <VTextField
            v-model="newEnrollmentData.start"
            label="Start date"
            type="datetime-local"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="10">
          <VTextField
            v-model="newEnrollmentData.end"
            label="End date"
            type="datetime-local"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="10">
          <VTextField
            v-model="newEnrollmentData.title"
            label="Title"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="10">
          <VTextarea
            v-model="newEnrollmentData.description"
            label="Description"
            clearable
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="10">
          <OfferedCourses :offered-courses-array="sharedObject" />
          <VBtn
            justify="center"
            text="Create enrollment"
            @click="createEnrollment"
          />
        </VCol>
      </VRow>
    </VContainer>
  </VForm>
</template>
