<script setup lang="ts">
import { reactive } from 'vue'

const newEnrollmentData = reactive({
  description: '',
  end: '',
  offeredCourses: [],
  start: '',
  title: '',
})

function createEnrollment() {
  //TODO: Create new object in backend
  console.log(newEnrollmentData)
  console.log('saved')
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
          <OfferedCourses />
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
