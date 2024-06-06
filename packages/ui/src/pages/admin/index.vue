<script setup lang="ts">
import ballot from '@/assets/ballot.png'
import compass from '@/assets/compass.png'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import {
  mdiAccountMultiple,
  mdiBookMultiple,
  mdiCalendarClock,
  mdiTimetable,
} from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import {
  VCard,
  VCardText,
  VCardTitle,
  VCol,
  VContainer,
  VIcon,
  VRow,
} from 'vuetify/components'
const { t } = useI18n()
const theme = useTheme()
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

    <VRow>
      <VCol cols="12" md="6" xl="3">
        <VCard
          :title="t('current-phase')"
          :to="`admin/phases/${adminCourses.currentPhase?.id}`"
          class="h-100"
          color="#ADD8E6"
          density="compact"
        >
          <VCardText>
            <VRow>
              <VCol class="d-flex align-center justify-center" cols="8">
                <EnrollmentPhase
                  :phase-id="adminCourses.currentPhase?.id"
                  class="pa-4"
                />
              </VCol>
              <VCol class="d-flex align-center justify-center" cols="4">
                <VIcon :icon="mdiTimetable" size="130px" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

      <VCol cols="12" md="6" xl="3">
        <VCard :title="t('statistics')" class="h-100" color="#FFD580" link>
          <VCardText>
            <VRow>
              <VCol class="d-flex align-center justify-center">
                <div>
                  <p class="text-center mb-0">
                    <span class="text-h1">{{
                      phaseStats?.studentCount ?? '_'
                    }}</span>
                  </p>
                  <p class="text-center mb-0">
                    {{ t('registered-students') }}
                  </p>
                </div>
              </VCol>
              <VCol class="d-flex align-center justify-center">
                <VIcon :icon="mdiAccountMultiple" size="130px" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
      <!-- Assign Students Button -->
      <VCol cols="12" md="6" xl="3">
        <VCard
          :title="t('all-courses')"
          class="h-100"
          color="#90EE90"
          to="admin/courses"
        >
          <VCardText>
            <VRow>
              <VCol class="d-flex align-center justify-center">
                <div>
                  <p class="text-center mb-0" style="color: $black">
                    <span class="text-h1">{{
                      adminCourses.courses.length
                    }}</span>
                  </p>
                  <p class="text-center mb-0" style="color: $black">
                    {{ t('total-courses') }}
                  </p>
                </div>
              </VCol>
              <VCol class="d-flex align-center justify-center">
                <VIcon :icon="mdiBookMultiple" size="130px" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="6" xl="3">
        <VCard class="h-100" color="#FF7F7F" to="admin/phases">
          <VCardTitle class="black">
            {{ t('all-phases') }}
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol class="d-flex align-center justify-center">
                <div>
                  <p class="text-center mb-0 black">
                    <span class="text-h1">{{
                      Object.keys(adminCourses.phases).length
                    }}</span>
                  </p>
                  <p class="text-center mb-0 black">
                    {{ t('total-phases') }}
                  </p>
                </div>
              </VCol>
              <VCol class="d-flex align-center justify-center">
                <VIcon :icon="mdiCalendarClock" color="black" size="130px" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
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
      </VCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tile {
  height: 15rem;
  width: 25rem;

  .img {
    filter: invert(1);
  }
}
</style>

<i18n lang="yaml">
en:
  dashboard: Dashboard
  current-phase: Current Phase
  statistics: Statistics
  registered-students: Registered Students
  all-courses: All Courses
  all-phases: All Phases
  available-courses: Available Courses
  total-courses: Total courses
  total-phases: Total phases
de:
  dashboard: Übersicht
  current-phase: Aktuelle Phase
  statistics: Statistik
  registered-students: Angemeldete Studierende
  all-courses: Alle Kurse
  all-phases: Alle Phasen
  available-courses: Verfügbare Kurse
  total-courses: Kurse
  total-phases: Phasen
</i18n>

<style lang="scss" scoped>
$black: #000000;

.black {
  color: $black;
}
</style>
