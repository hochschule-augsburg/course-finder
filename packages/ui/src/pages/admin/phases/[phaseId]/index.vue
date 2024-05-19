<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { VBtn, VCol, VContainer, VRow } from 'vuetify/components'

const { t } = useI18n()

const route = useRoute()
const phaseId = Number(route.params.phaseId)
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
              <VCol cols="6">
                <VBtn :to="`${phaseId}/edit`">{{ t('edit') }}</VBtn>
              </VCol>
              <VCol cols="6">
                <VBtn>{{ t('close') }}</VBtn>
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

de:
  edit: Bearbeiten
  close: Schließen
  assignments: Zuordnungen
  phase-not-found: Phase nicht gefunden
</i18n>
