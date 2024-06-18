<script lang="ts" setup>
import { fieldsOfStudyAbbrMap } from '@/helper/enums/fieldsOfStudy'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VTable } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()

const { locale, t } = useI18n()

const adminCoursesStore = useAdminCoursesStore()
const adminStats = useAdminStatsStore()

const sortedCourses = computed(() =>
  adminCoursesStore.phaseOfferedCourses[props.phaseId]?.map((course) => ({
    ...course,
    ...adminStats.course[props.phaseId]?.[course.moduleCode],
  })),
)

watch(
  () => props.phaseId,
  async () => {
    await adminCoursesStore.fetchOfferedCourses(props.phaseId)
    void adminStats.fetchCourse(props.phaseId)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <VTable height="1000px" fixed-header hover>
      <thead>
        <tr>
          <th>
            <strong>{{ t('module-code') }}</strong>
          </th>
          <th>
            <strong>{{ t('title') }}</strong>
          </th>
          <th>
            <strong>{{ t('fields-of-study') }}</strong>
          </th>
          <th>
            <strong>{{ t('min') }}</strong>
          </th>
          <th>
            <strong>{{ t('max') }}</strong>
          </th>
          <th>
            <strong>{{ t('count') }}</strong>
          </th>
          <th>
            <strong><span class="text-h6">⌀</span> {{ t('points') }}</strong>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in sortedCourses" :key="course.moduleCode">
          <td>{{ course.moduleCode }}</td>
          <td>
            {{ course.Course.title?.[locale] }}
          </td>
          <td>
            {{ course.for.map((e) => fieldsOfStudyAbbrMap[e] ?? e).join(', ') }}
          </td>
          <template v-if="!course.externalRegistration">
            <td>{{ course.minParticipants }}</td>
            <td>{{ course.maxParticipants }}</td>
          </template>
          <template v-else>
            <td colspan="2">{{ t('external-registration') }}</td>
          </template>
          <td>{{ course.studentCount }}</td>
          <td>{{ course.avgPoints }}</td>
        </tr>
      </tbody>
    </VTable>
  </div>
</template>

<i18n lang="yaml">
en:
  module-code: Module code
  title: Title
  fields-of-study: Fields of study
  min: Min
  max: Max
  count: Count
  points: Points
  external-registration: External registration
de:
  module-code: Modulcode
  title: Titel
  fields-of-study: Studiengänge
  min: Min
  max: Max
  count: Anzahl
  points: Punkte
  external-registration: Externe Anmeldung
</i18n>
