<script setup lang="ts">
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import { computedAsync } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VCard,
  VCardSubtitle,
  VCardText,
  VCol,
  VContainer,
  VRow,
} from 'vuetify/components'
const { t } = useI18n()
const adminCourses = useAdminCoursesStore()
const adminStats = useAdminStatsStore()

const phaseStats = computedAsync(async () => {
  if (!adminCourses.currentPhase) {
    return
  }
  await adminStats.fetchPhase(adminCourses.currentPhase?.id)
  return adminStats.phase[adminCourses.currentPhase?.id]
})
</script>

<template>
  <VContainer>
    <VRow>
      <VCol>
        <h1>{{ t('dashboard') }}</h1>
      </VCol>
    </VRow>

    <VRow justify="center">
      <VCol v-if="adminCourses.currentPhase" cols="12" md="4" sm="6">
        <VCard
          :title="t('current-phase')"
          :to="`admin/phases/${adminCourses.currentPhase?.id}`"
          density="compact"
        >
          <VCardText>
            <EnrollmentPhase
              :phase-id="adminCourses.currentPhase?.id"
              class="pa-4"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol v-if="adminCourses.currentPhase" cols="10" md="3" sm="6">
        <VCard :title="t('statistics')" class="h-100" link>
          <VCardText>
            <p class="text-center text-weight-bold" style="font-size: 4rem">
              <span>{{ phaseStats?.studentCount ?? '_' }}</span>
            </p>
          </VCardText>
          <VCardSubtitle>{{ t('registered-students') }}</VCardSubtitle>
        </VCard>
      </VCol>
      <!-- Assign Students Button -->
      <VCol cols="12" md="3">
        <VRow>
          <VCol cols="12">
            <VBtn color="success" to="admin/courses" block>
              {{ t('all-courses') }}
            </VBtn>
          </VCol>
          <VCol cols="12">
            <VBtn color="info" to="admin/phases" block>
              {{ t('all-phases') }}
            </VBtn>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12">
        <h2>{{ t('available-courses') }}</h2>
      </VCol>
      <VCol cols="36">
        <OfferedCoursesTable
          v-if="adminCourses.currentPhase"
          :phase-id="adminCourses.currentPhase?.id"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<i18n lang="yaml">
en:
  dashboard: Dashboard
  current-phase: Current Phase
  statistics: Statistics
  registered-students: Registered Students
  all-courses: All Courses
  all-phases: All Phases
  available-courses: Available Courses
de:
  dashboard: Übersicht
  current-phase: Aktuelle Phase
  statistics: Statistik
  registered-students: Angemeldete Studierende
  all-courses: Alle Kurse
  all-phases: Alle Phasen
  available-courses: Verfügbare Kurse
</i18n>
