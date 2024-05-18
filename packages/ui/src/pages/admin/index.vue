<script setup lang="ts">
import { trpc } from '@/api/trpc'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
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
const adminStore = useAdminCoursesStore()

const courseStats = computedAsync(() =>
  adminStore.currentPhase
    ? trpc.admin.enroll.statistics.phase.query({
        phaseId: adminStore.currentPhase.id,
      })
    : undefined,
)
</script>

<template>
  <VContainer>
    <VRow>
      <VCol>
        <h1>Dashboard</h1>
      </VCol>
    </VRow>

    <VRow justify="center">
      <VCol cols="12" md="4" sm="6">
        <VCard
          :to="`admin/phases/${adminStore.currentPhase?.id}`"
          density="compact"
          title="Current Phase"
        >
          <VCardText>
            <EnrollmentPhase
              :phase-id="adminStore.currentPhase?.id"
              class="pa-4"
            />
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="10" md="3" sm="6">
        <VCard class="h-100" title="Statistik" link>
          <VCardText>
            <p class="text-center text-weight-bold" style="font-size: 4rem">
              {{ courseStats?.studentCount ?? 0 }}
            </p>
          </VCardText>
          <VCardSubtitle> Angemeldete Studierende </VCardSubtitle>
        </VCard>
      </VCol>
      <!-- Assign Students Button -->
      <VCol cols="12" md="3">
        <VRow>
          <VCol cols="12">
            <VBtn color="success" to="admin/courses" block>All Courses</VBtn>
          </VCol>
          <VCol cols="12">
            <VBtn color="info" to="admin/phases" block>All Phases</VBtn>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12">
        <h2>Angebotene Kurse</h2>
      </VCol>
      <VCol cols="36">
        <OfferedCoursesTable
          v-if="adminStore.currentPhase"
          :phase-id="adminStore.currentPhase?.id"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<i18n lang="yaml">
en:
  title: Administration
  available-courses: Available courses
de:
  title: Verwaltung
  available-courses: Verfügbare Kurse
</i18n>
