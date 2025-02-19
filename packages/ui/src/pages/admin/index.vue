<script setup lang="ts">
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import {
  mdiAccountMultiple,
  mdiBookMultiple,
  mdiCalendarClock,
  mdiCog,
  mdiTimetable,
} from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import {
  VCard,
  VCardText,
  VCol,
  VContainer,
  VIcon,
  VRow,
} from 'vuetify/components'

defineOptions({
  name: 'AdminDashboard',
})

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
    <VRow justify="space-between">
      <VCol>
        <h1>Übersicht</h1>
      </VCol>
      <VBtn to="admin/settings" icon>
        <VIcon :icon="mdiCog" />
        <VTooltip activator="parent" location="bottom" offset="2">
          Einstellungen
        </VTooltip>
      </VBtn>
    </VRow>

    <VRow>
      <template v-if="adminCourses.currentPhase">
        <VCol cols="12" md="6" xl="3">
          <VCard
            :to="`admin/phases/${adminCourses.currentPhase?.id}`"
            class="h-100"
            color="#ADD8E6"
            density="compact"
            title="Aktuelle Phase"
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
        </VCol>

        <VCol cols="12" md="6" xl="3">
          <VCard class="h-100" color="#FFD580" title="Statistik" link>
            <VCardText>
              <VRow>
                <VCol class="d-flex align-center justify-center">
                  <div>
                    <p class="text-center mb-0">
                      <span class="text-h1">{{
                        phaseStats?.studentCount ?? '_'
                      }}</span>
                    </p>
                    <p class="text-center mb-0">Angemeldete Studierende</p>
                  </div>
                </VCol>
                <VCol class="d-flex align-center justify-center">
                  <VIcon :icon="mdiAccountMultiple" size="130px" />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>
      </template>

      <!-- Assign Students Button -->
      <VCol cols="12" md="6" xl="3">
        <VCard
          class="h-100"
          color="#90EE90"
          title="Alle Kurse"
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
                  <p class="text-center mb-0" style="color: $black">Kurse</p>
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
          <VCardTitle class="black"> Alle Phasen </VCardTitle>
          <VCardText>
            <VRow>
              <VCol class="d-flex align-center justify-center">
                <div>
                  <p class="text-center mb-0 black">
                    <span class="text-h1">{{
                      Object.keys(adminCourses.phases).length
                    }}</span>
                  </p>
                  <p class="text-center mb-0 black">Phasen</p>
                </div>
              </VCol>

              <VCol class="d-flex align-center justify-center">
                <VIcon :icon="mdiCalendarClock" class="icon" size="130px" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped lang="scss">
.v-icon:hover {
  color: initial;
}

$black: #000000;

.black {
  color: $black;
}

.icon {
  color: $black;
}

.icon:hover {
  color: rgb(var(--v-theme-primary));
}
</style>
