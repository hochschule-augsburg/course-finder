<script lang="ts" setup>
import type { Phase } from '@/stores/admin/AdminCoursesStore'

import { phaseStates as orgPhaseStates } from '@/helper/enums/phaseStates'
import {
  useAdminCoursesStore,
  usePhaseState,
} from '@/stores/admin/AdminCoursesStore'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VListItem,
  VSelect,
  VSnackbar,
  VTooltip,
} from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()

const { locale, t } = useI18n()
const coursesStore = useAdminCoursesStore()

const phaseState = usePhaseState(props.phaseId)
const phaseStates = orgPhaseStates.filter(
  (e) => !['FINISHED', 'NOT_STARTED'].includes(e.value),
)
const error = ref<string>()
const phaseAlreadyActive = computed(() =>
  Object.values(coursesStore.phases)
    .filter(
      (e) =>
        e.id !== props.phaseId &&
        !['FINISHED', 'NOT_STARTED'].includes(e.state),
    )
    .at(0),
)

async function updateState(newValue: Phase['state']) {
  const result = await coursesStore.updatePhaseState(props.phaseId, newValue)
  if ('error' in result) {
    error.value = t(result.error, [result.phase.title[locale.value]])
  }
}
</script>

<template>
  <div>
    <VTooltip
      v-if="phaseState.modelValue === 'NOT_STARTED'"
      :disabled="!phaseAlreadyActive"
      location="top"
    >
      <template #activator="{ props: tipProps }">
        <div v-bind="tipProps">
          <VBtn :disabled="!!phaseAlreadyActive" @click="updateState('OPEN')">
            {{ t('open-phase') }}
          </VBtn>
        </div>
      </template>
      {{ t('a-phase-is-already-active', [phaseAlreadyActive?.title[locale]]) }}
    </VTooltip>
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
    <VBtn v-else-if="phaseState.modelValue" @click="updateState('DRAWING')">
      {{ t('redraw') }}
    </VBtn>
    <VSnackbar
      :model-value="!!error"
      :timeout="2000"
      color="error"
      location="bottom left"
      rounded="pill"
      @update:model-value="(value) => (value ? (error = undefined) : null)"
    >
      {{ error || '' }}
    </VSnackbar>
  </div>
</template>

<i18n lang="yaml">
en:
  phase-state: Phase State
  open-phase: Open Phase
  redraw: Redraw
  a-phase-is-already-active: Phase {0} is already active

de:
  phase-state: Zustand
  open-phase: Phase eröffnen
  redraw: Neu ziehen
  a-phase-is-already-active: Die Phase {0} ist bereits aktiv
</i18n>
