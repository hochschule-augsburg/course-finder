<script lang="ts" setup>
import { trpc } from '@/api/trpc'
import { fieldsOfStudyAbbrMap } from '@/helper/fieldsOfStudy'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { VTable } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()

const { locale, t } = useI18n()

const adminCoursesStore = useAdminCoursesStore()
const courseStats = ref<
  Record<string, { avgPoints: number; studentCount: number } | undefined>
>({})

const sortedCourses = computed(() =>
  adminCoursesStore.phaseOfferedCourses[props.phaseId]?.map((course) => ({
    ...course,
    ...courseStats.value[course.moduleCode],
  })),
)

watch(
  () => props.phaseId,
  async () => {
    await adminCoursesStore.fetchOfferedCourses(props.phaseId)
    void fetchCourseStats(props.phaseId)
  },
  { immediate: true },
)

async function fetchCourseStats(phaseId: number) {
  const result = await trpc.admin.enroll.statistics.courseEnrollments.query({
    phaseId,
  })
  courseStats.value = Object.fromEntries(result.map((e) => [e.moduleCode, e]))
}
</script>

<template>
  <div>
    <VTable>
      <thead>
        <tr>
          <th>Module code</th>
          <th>Title</th>
          <th>Studiengänge</th>
          <th>min</th>
          <th>max</th>
          <th>Anzahl</th>
          <th><span class="text-h6">⌀</span> Punkte</th>
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
          <td>
            {{ course.minParticipants }}
          </td>
          <td>
            {{ course.maxParticipants }}
          </td>
          <td>{{ course.studentCount }}</td>
          <td>{{ course.avgPoints }}</td>
        </tr>
      </tbody>
    </VTable>
  </div>
</template>
