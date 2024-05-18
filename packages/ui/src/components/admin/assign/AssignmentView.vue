<script lang="ts" setup>
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { VTable } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()
const { locale, t } = useI18n()

const adminCoursesStore = useAdminCoursesStore()

onBeforeMount(() => {
  void adminCoursesStore.fetchAssignments(props.phaseId)
})
</script>

<template>
  <VTable>
    <thead>
      <tr>
        <th>{{ t('module-code') }}</th>
        <th>{{ t('title') }}</th>
        <th>{{ t('count') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="course in adminCoursesStore.assignments[props.phaseId]"
        :key="course.moduleCode"
      >
        <td>{{ course.moduleCode }}</td>
        <td>{{ locale === 'en' ? course.title?.en : course.title?.de }}</td>
        <td>{{ course.count }}</td>
      </tr>
    </tbody>
  </VTable>
</template>
