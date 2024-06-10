<script lang="ts" setup>
import { usePhaseState } from '@/stores/admin/AdminCoursesStore'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { definePage } from 'vue-router/auto'
import { VBtn, VCol, VContainer, VRow } from 'vuetify/components'

definePage({
  name: 'admin.phases.phaseId.index',
})

const { t } = useI18n()

const route = useRoute()
const phaseId = Number(route.params.phaseId)

const phaseState = usePhaseState(phaseId)
</script>

<template>
  <div class="mx-15">
    <template v-if="phaseId">
      <VContainer>
        <VRow>
          <VCol cols="12" md="6">
            <VRow>
              <VCol>
                <EnrollmentPhase :phase-id class="pb-4" />
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="12" md="6">
            <VRow>
              <VCol cols="4">
                <VBtn :to="`${phaseId}/edit`">{{ t('edit') }}</VBtn>
              </VCol>
              <VCol cols="5">
                <PhaseStateButton :phase-id />
              </VCol>
            </VRow>
          </VCol>
        </VRow>
        <VRow v-if="['DRAWING', 'FINISHED'].includes(phaseState.modelValue)">
          <VCol>
            <h2>{{ t('assignments') }}</h2>
          </VCol>
          <VCol>
            <AssignmentView :phase-id />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <h2>{{ t('available-courses') }}</h2>
          </VCol>
          <VCol cols="36">
            <OfferedCoursesTable :phase-id />
          </VCol>
        </VRow>
      </VContainer>
    </template>
    <template v-else>
      <h1>{{ t('phase-not-found') }}</h1>
    </template>
  </div>
</template>

<i18n lang="yaml">
en:
  edit: Edit
  close: Close
  assignments: Assignments
  phase-not-found: Phase not found
  available-courses: Available Courses

de:
  edit: Bearbeiten
  close: Schließen
  assignments: Zuordnungen
  phase-not-found: Phase nicht gefunden
  available-courses: Verfügbare Kurse
</i18n>
