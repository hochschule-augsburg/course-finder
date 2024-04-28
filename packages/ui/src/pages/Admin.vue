<script setup lang="ts">
import { VCol, VContainer, VRow } from 'vuetify/components'
</script>

<template>
  <VContainer fluid>
    <VRow justify="center">
      <VCol cols="10">
        <EnrollmentPhase />
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="10">
        <VBtn text="Create enrollment phase" to="/createEnrollment" />
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="10">
        <h2>Available subjects</h2>
        <FilterSection />
        <AdminSubjectList />
      </VCol>
    </VRow>
  </VContainer>
</template>
