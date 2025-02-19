<script lang="ts" setup>
import { fieldsOfStudyAbbrMap } from '@/helper/enums/fieldsOfStudy'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import { computed, watch } from 'vue'
import { VTable } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()

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
            <strong>Modulcode</strong>
          </th>
          <th>
            <strong>Titel</strong>
          </th>
          <th>
            <strong>Studiengänge</strong>
          </th>
          <th>
            <strong>Min</strong>
          </th>
          <th>
            <strong>Max</strong>
          </th>
          <th>
            <strong>Anzahl Anmeldungen</strong>
          </th>
          <th>
            <strong><span class="text-h6">⌀</span> Punkte</strong>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="course in sortedCourses"
          :class="{
            'bg-red-lighten-5':
              !course.externalRegistration &&
              (course.studentCount ?? 0) < course.minParticipants,
            'bg-yellow-lighten-5':
              course.maxParticipants &&
              (course.studentCount ?? 0) > course.maxParticipants,
          }"
          :key="course.moduleCode"
        >
          <td>{{ course.moduleCode }}</td>
          <td>
            {{ course.Course.title?.de }}
          </td>
          <td>
            {{ course.for.map((e) => fieldsOfStudyAbbrMap[e] ?? e).join(', ') }}
          </td>
          <template v-if="!course.externalRegistration">
            <td>{{ course.minParticipants }}</td>
            <td>{{ course.maxParticipants }}</td>
          </template>
          <template v-else>
            <td colspan="2">Externe Anmeldung</td>
          </template>
          <td>{{ course.studentCount }}</td>
          <td>{{ course.avgPoints }}</td>
        </tr>
      </tbody>
    </VTable>
  </div>
</template>
