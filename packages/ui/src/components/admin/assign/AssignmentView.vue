<script lang="ts" setup>
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import { VBtn, VCol, VContainer, VRow, VTable } from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()
const { locale, t } = useI18n()

const adminCoursesStore = useAdminCoursesStore()

onBeforeMount(() => {
  void adminCoursesStore.fetchAssignments(props.phaseId)
})
</script>

<template>
  <VContainer>
    <VCol :cols="3">
      <VRow justify-md="space-around">
        <VBtn v-if="true">Close</VBtn>
        <VBtn v-if="true /*else*/">Assign</VBtn>
        <VBtn>Edit</VBtn>
      </VRow>
    </VCol>
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
  </VContainer>
</template>

<style lang="scss" scoped></style>
