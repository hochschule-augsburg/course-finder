<script lang="ts" setup>
import { useRoute } from 'vue-router/auto'
import { VBtn, VCol, VContainer, VRow } from 'vuetify/components'

import { dialogService } from '@/components/DialogService'
import { usePhaseState } from '@/stores/admin/AdminCoursesStore'
import { trpc } from '@/trpc'

const route = useRoute()
//@ts-expect-error auto type not working
const phaseId = Number(route.params.phaseId)

const phaseState = usePhaseState(phaseId)

function sendOpeningMail() {
  dialogService.showDialog({
    onCancel: () => {},
    onConfirm: () => {
      void trpc.admin.enroll.phase.sendOpeningMail.mutate({ phaseId })
    },
    text: '',
    title: 'Wirklich senden?',
  })
}

function sendReminderMail() {
  dialogService.showDialog({
    onCancel: () => {},
    onConfirm: () => {
      void trpc.admin.enroll.phase.sendReminderMail.mutate({ phaseId })
    },
    text: '',
    title: 'Wirklich senden?',
  })
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
              <VCol cols="5">
                <div class="d-flex flex-column align-center ga-4">
                  <VBtn :to="`${phaseId}/edit`">Bearbeiten</VBtn>
                  <VBtn
                    v-if="phaseState.modelValue === 'OPEN'"
                    @click="sendOpeningMail"
                  >
                    Eröffnungsmail senden
                  </VBtn>
                  <VBtn
                    v-if="phaseState.modelValue === 'OPEN'"
                    @click="sendReminderMail"
                  >
                    Erinnerungsmails senden
                  </VBtn>
                </div>
              </VCol>
              <VCol cols="5">
                <PhaseStateButton :phase-id />
              </VCol>
            </VRow>
          </VCol>
        </VRow>
        <template
          v-if="['DRAWING', 'FINISHED'].includes(phaseState.modelValue)"
        >
          <VRow>
            <VCol>
              <h2>Zuordnungen</h2>
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <AssignmentView :phase-id />
            </VCol>
          </VRow>
        </template>
        <VRow>
          <VCol cols="12">
            <h2>Verfügbare Kurse</h2>
          </VCol>
          <VCol cols="36">
            <OfferedCoursesTable :phase-id />
          </VCol>
        </VRow>
      </VContainer>
    </template>
    <template v-else>
      <h1>Phase nicht gefunden</h1>
    </template>
  </div>
</template>
