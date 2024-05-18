<script lang="ts" setup>
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { VBtn, VContainer, VRow } from 'vuetify/components'

const adminCoursesStore = useAdminCoursesStore()
</script>

<template>
  <div class="mx-10">
    <h1>Passed Phases</h1>
    <VContainer>
      <VRow justify="center">
        <VCol
          v-for="phase in adminCoursesStore.phases"
          :key="phase.id"
          cols="auto"
        >
          <VBtn
            :to="`phases/${phase.id}`"
            height="150"
            style="text-align: left; text-transform: none; font-weight: normal"
            width="350"
          >
            <EnrollmentPhase :phase-id="phase.id" />
          </VBtn>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
