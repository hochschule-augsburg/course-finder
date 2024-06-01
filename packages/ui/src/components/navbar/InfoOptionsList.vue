<script setup lang="ts">
import { homeTour, useTourPool } from '@/composables/tourPool'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useI18n } from 'vue-i18n'
import { VDivider, VList, VListItem } from 'vuetify/components'

const { t } = useI18n()
const { startTour } = useTourPool()
const coursesStore = useCoursesStore()
</script>

<template>
  <VList>
    <VListItem
      v-if="coursesStore.currentPhase"
      :title="t('tutorial')"
      @click="startTour(homeTour)"
    />
    <VDivider v-if="coursesStore.currentPhase" />
    <VListItem
      :title="t('documentation')"
      href="https://sirchnik.github.io/subject-enroll/"
      target="_blank"
    />
  </VList>
</template>

<i18n lang="yaml">
en:
  tutorial: Tutorial
  documentation: Documentation
de:
  tutorial: Tutorial
  documentation: Dokumentation
</i18n>
