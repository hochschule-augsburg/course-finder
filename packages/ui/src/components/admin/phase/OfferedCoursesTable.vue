<script lang="ts" setup>
import { fieldsOfStudyAbbrMap } from '@/helper/fieldsOfStudy'
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
    <VTable>
      <thead>
        <tr>
          <th>{{ t('module-code') }}</th>
          <th>{{ t('title') }}</th>
          <th>{{ t('fields-of-study') }}</th>
          <th>{{ t('min') }}</th>
          <th>{{ t('max') }}</th>
          <th>{{ t('count') }}</th>
          <th><span class="text-h6">⌀</span> {{ t('points') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="course in sortedCourses" :key="course.moduleCode">
          <td>{{ course.moduleCode }}</td>
          <td>
            {{
              locale === 'en'
                ? course.Course.title?.en
                : course.Course.title?.de
            }}
          </td>
          <td>
            {{ course.for.map((e) => fieldsOfStudyAbbrMap[e] ?? e).join(', ') }}
          </td>
          <td>{{ course.minParticipants }}</td>
          <td>{{ course.maxParticipants }}</td>
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
de:
  module-code: Modulcode
  title: Titel
  fields-of-study: Studiengänge
  min: Min
  max: Max
  count: Anzahl
  points: Punkte
</i18n>
