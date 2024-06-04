<script lang="ts" setup>
import { phaseStates as orgPhaseStates } from '@/helper/enums/phaseStates'
import { useAdminAssignStore } from '@/stores/admin/AdminAssignStore'
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
const assignmentStore = useAdminAssignStore()

const route = useRoute()
const phaseId = Number(route.params.phaseId)

const phaseState = computed(() => {
  const state = coursesStore.phases[phaseId]?.state
  return {
    modelValue: state,
    text: orgPhaseStates.find((e) => e.value === state)?.text,
  }
})
const phaseStates = computed(() => {
  let states = orgPhaseStates.slice()
  if (
    !assignmentStore.assignments[phaseId]?.length &&
    phaseState.value.modelValue !== 'FINISHED'
  ) {
    states = states.filter((e) => e.value !== 'FINISHED')
  }
  if (phaseState.value.modelValue !== 'NOT_STARTED') {
    states = states.filter((e) => e.value !== 'NOT_STARTED')
  }
  return states
})
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
                <VSelect
                  :item-title="(e) => t(`phase-states.${e.text}`)"
                  :item-value="(e) => e.value"
                  :items="phaseStates"
                  :label="t('phase-state')"
                  :model-value="phaseState.modelValue"
                  @update:model-value="
                    (value) => coursesStore.updatePhaseState(phaseId, value)
                  "
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
              </VCol>
            </VRow>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <h2>{{ t('assignments') }}</h2>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <AssignmentView :phase-id />
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

de:
  edit: Bearbeiten
  close: Schließen
  assignments: Zuordnungen
  phase-not-found: Phase nicht gefunden
  phase-state: Zustand
</i18n>
