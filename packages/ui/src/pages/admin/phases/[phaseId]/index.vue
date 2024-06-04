<script lang="ts" setup>
import type { Phase } from '@/stores/admin/AdminCoursesStore'

import { phaseStates as orgPhaseStates } from '@/helper/enums/phaseStates'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  VBtn,
  VCol,
  VContainer,
  VListItem,
  VRow,
  VSelect,
} from 'vuetify/components'

const { t } = useI18n()
const coursesStore = useAdminCoursesStore()

const route = useRoute()
const phaseId = Number(route.params.phaseId)

const phaseState = computed(() => {
  const state = coursesStore.phases[phaseId]?.state
  return {
    modelValue: state,
    text: orgPhaseStates.find((e) => e.value === state)?.text,
  }
})
const phaseStates = orgPhaseStates.filter((e) =>
  ['FINISHED', 'NOT_STARTED', 'OPEN'].includes(e.value),
)

async function updateState(newValue: Phase['state']) {
  await coursesStore.updatePhaseState(phaseId, newValue)
}
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
              <VCol cols="8">
                <VBtn
                  v-if="phaseState.modelValue === 'NOT_STARTED'"
                  @click="updateState('OPEN')"
                >
                  {{ t('open-phase') }}
                </VBtn>
                <VSelect
                  v-else-if="phaseState.modelValue !== 'FINISHED'"
                  :item-title="(e) => t(`phase-states.${e.text}`)"
                  :item-value="(e) => e.value"
                  :items="phaseStates"
                  :label="t('phase-state')"
                  :model-value="phaseState.modelValue"
                  @update:model-value="(value) => updateState(value)"
                >
                  <template #item="{ props: itemProps, item }">
                    <VListItem
                      v-bind="itemProps"
                      :subtitle="t(`phase-states.long.${item.raw.text}`)"
                    />
                  </template>
                  <template #loader>
                    <span class="text-caption">{{
                      t(`phase-states.long.${phaseState.text}`)
                    }}</span>
                  </template>
                </VSelect>
                <VBtn v-else @click="updateState('DRAWING')">
                  {{ t('redraw') }}
                </VBtn>
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
  phase-state: Phase State
  open-phase: Open Phase
  redraw: Redraw
  available-courses: Available Courses

de:
  edit: Bearbeiten
  close: Schließen
  assignments: Zuordnungen
  phase-not-found: Phase nicht gefunden
  phase-state: Zustand
  open-phase: Phase eröffnen
  redraw: Neu ziehen
  available-courses: Verfügbare Kurse
</i18n>
