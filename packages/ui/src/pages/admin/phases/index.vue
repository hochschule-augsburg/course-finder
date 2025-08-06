<script lang="ts" setup>
import {
  VBtn,
  VCard,
  VCardText,
  VCol,
  VContainer,
  VRow,
} from 'vuetify/components'

import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'

const adminCoursesStore = useAdminCoursesStore()
</script>

<template>
  <div class="mx-10">
    <div class="d-flex justify-space-between">
      <h1>Anmeldephasen</h1>
      <VBtn class="mr-8" color="primary" to="phases/new/edit">
        Hinzufügen
      </VBtn>
    </div>
    <VContainer>
      <VRow justify="center">
        <VCol
          v-for="phase in adminCoursesStore.phases"
          :key="phase.id"
          cols="auto"
        >
          <VCard
            :to="`phases/${phase.id}`"
            density="compact"
            height="150"
            width="350"
          >
            <VCardText>
              <EnrollmentPhase :phase-id="phase.id" class="pa-4" />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
