<script setup lang="ts">
import { trpc } from '@/api/trpc'
import { ref } from 'vue'

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

const formData = ref({
  description: { de: '', en: '' }, // [I18n]
  end: '',
  start: '',
  title: { de: '', en: '' }, // [I18n]
})

async function createEnrollment() {
  const enrollmentPhaseData = {
    description: {
      de: formData.value.description.de,
      en: formData.value.description.en,
    },
    end: formData.value.end,
    offeredCourses: sharedObject.value,
    start: formData.value.start,
    title: { de: formData.value.title.de, en: formData.value.title.en },
  }
  try {
    await trpc.admin.enroll.phase.create.mutate(enrollmentPhaseData)
    console.log('Success creating enroll phase')
  } catch (e) {
    console.log('Error creating enroll phase')
  }
  sharedObject.value = []
}
</script>

<template>
  <VForm>
    <VContainer>
      <VRow justify="center">
        <VCol cols="12" sm="5"><h1>Create enrollment</h1></VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.start"
            label="Start date"
            type="datetime-local"
            required
          />
        </VCol>
        <VCol cols="12" sm="5">
          <VTextField
            v-model="formData.end"
            label="End date"
            type="datetime-local"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VTextField v-model="formData.title.en" label="Title (en)" required />
        </VCol>
        <VCol cols="12" sm="5">
          <VTextField v-model="formData.title.de" label="Title (de)" required />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="10">
          <VTextarea
            v-model="formData.description.en"
            label="Description (en)"
            required
          />
        </VCol>
        <VCol cols="12" sm="10">
          <VTextarea
            v-model="formData.description.de"
            label="Description (de)"
            required
          />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5"><h1>Offered Courses</h1></VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="10">
          <OfferedCourses :offered-courses-array="sharedObject" />
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="5">
          <VBtn
            justify="center"
            text="Create enrollment"
            @click="createEnrollment"
          />
        </VCol>
        <VCol cols="12" sm="5"><VSpacer /></VCol>
      </VRow>
    </VContainer>
  </VForm>
</template>
