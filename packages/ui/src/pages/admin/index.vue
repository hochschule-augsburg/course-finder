<script setup lang="ts">
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useI18n } from 'vue-i18n'
import { VBtn, VCol, VContainer, VRow } from 'vuetify/components'
const { t } = useI18n()
const adminStore = useAdminCoursesStore()
</script>

<template>
  <VContainer fluid>
    <VRow justify="center">
      <VCol cols="10">
        <h1>{{ t('title') }}</h1>
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="5">
        <VBtn
          :to="`admin/phase-${adminStore.currentPhase?.id}`"
          height="150"
          style="text-align: left; text-transform: none"
        >
          <EnrollmentPhase
            :phase-id="adminStore.currentPhase?.id"
            class="pa-4"
          />
        </VBtn>
      </VCol>
      <VCol align-self="center" cols="3">
        <VBtn text="Create enrollment phase" to="admin/phase-new/edit" />
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="3" />
    </VRow>
    <VRow justify="center">
      <VCol cols="10">
        <h2>{{ t('available-courses') }}</h2>
        <AdminSubjectList />
      </VCol>
    </VRow>
  </VContainer>
</template>

<i18n lang="yaml">
en:
  title: Administration
  available-courses: Available courses
de:
  title: Verwaltung
  available-courses: Verfügbare Kurse
</i18n>
