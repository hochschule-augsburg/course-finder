<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const phaseId = Number(route.params.id)
/* eslint-disable vue/no-multiple-template-root */
</script>

<template>
  <div class="mx-10">
    <template v-if="phaseId">
      <EnrollmentPhase :phase-id />
      <AssignmentView :phase-id />
    </template>
    <template v-else>
      <h1>Phase not found</h1>
    </template>
  </div>
</template>
