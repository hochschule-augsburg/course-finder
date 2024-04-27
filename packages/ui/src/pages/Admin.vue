<script setup lang="ts">
import { VBtn } from 'vuetify/components'
</script>

<template>
  <div>
    <EnrollmentPhase />
    <FilterSection />
    <br />
    <VBtn text="Create enrollment phase" to="/createEnrollment"/>
    <AdminSubjectList />
  </div>
</template>
