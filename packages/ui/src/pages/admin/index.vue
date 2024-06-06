<script setup lang="ts">
import ballot from '@/assets/ballot.png'
import compass from '@/assets/compass.png'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import { computedAsync } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { VCard, VCardSubtitle, VCardText, VImg } from 'vuetify/components'
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
  <div class="mx-10">
    <h1>{{ t('dashboard') }}</h1>
    <div class="d-flex flex-wrap justify-space-around ga-4">
      <template v-if="adminCourses.currentPhase">
        <VCard
          :title="t('current-phase')"
          :to="`admin/phases/${adminCourses.currentPhase?.id}`"
          class="tile"
          density="compact"
        >
          <VCardText>
            <EnrollmentPhase
              :phase-id="adminCourses.currentPhase?.id"
              class="pa-4"
            />
          </VCardText>
        </VCard>

        <VCard :title="t('statistics')" class="tile">
          <VCardText>
            <p class="text-center text-weight-bold" style="font-size: 4rem">
              <span>{{ phaseStats?.studentCount ?? '_' }}</span>
            </p>
          </VCardText>
          <VCardSubtitle>{{ t('registered-students') }}</VCardSubtitle>
        </VCard>
      </template>
      <VCard :title="t('all-courses')" class="tile" to="admin/courses">
        <VImg
          :class="{
            img: theme.global.name.value === 'customDarkTheme',
          }"
          :src="compass"
          height="10rem"
        />
      </VCard>
      <VCard :title="t('all-phases')" class="tile" to="admin/phases">
        <VImg
          :class="{
            img: theme.global.name.value === 'customDarkTheme',
          }"
          :src="ballot"
          height="10rem"
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
de:
  dashboard: Übersicht
  current-phase: Aktuelle Phase
  statistics: Statistik
  registered-students: Angemeldete Studierende
  all-courses: Alle Kurse
  all-phases: Alle Phasen
</i18n>
