<script setup lang="ts">
import { useCoursesStore } from '@/stores/CoursesStore'
import { homeTour, useTourStore } from '@/stores/TourStore'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { VDivider, VList, VListItem } from 'vuetify/components'

const route = useRoute()
const { t } = useI18n()
const { startTour } = useTourStore()
const coursesStore = useCoursesStore()
</script>

<template>
  <VList>
    <VListItem
      v-if="coursesStore.currentPhase && route.path === '/'"
      :title="t('tutorial')"
      @click="startTour(homeTour)"
    />
    <VDivider v-if="coursesStore.currentPhase" />
    <VListItem
      :title="t('documentation')"
      href="https://hochschule-augsburg.github.io/course-finder/"
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
