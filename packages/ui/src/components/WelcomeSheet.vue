<script setup lang="ts">
import { useAssignStore } from '@/stores/AssignStore'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useUserStore } from '@/stores/UserStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const { locale } = useI18n()

const userStore = useUserStore()
const assignStore = useAssignStore()
const coursesStore = useCoursesStore()

const overviewPhase = computed(
  () => coursesStore.currentPhase || assignStore.assignPhases.at(-1)?.Phase,
)
</script>

<template>
  <VSheet
    class="px-4 py-3 clickable"
    color="secondary"
    id="enrollment-overview"
    rounded="lg"
  >
    <h2>Willkommen {{ userStore.user?.name }}</h2>
    <EnrollmentOverview
      v-if="overviewPhase"
      :phase="overviewPhase"
      class="mx-2 mb-9"
    />
    <VBtn v-if="overviewPhase?.state === 'FINISHED'" to="/results">
      Zu den Ergebnissen
    </VBtn>
  </VSheet>
</template>
