<script lang="ts" setup>
import { usePhaseState } from '@/stores/admin/AdminCoursesStore'
import { trpc } from '@/trpc'
import { useRoute } from 'vue-router/auto'
import { VBtn, VCol, VContainer, VRow } from 'vuetify/components'

const route = useRoute()
//@ts-expect-error auto type not working
const phaseId = Number(route.params.phaseId)

const phaseState = usePhaseState(phaseId)

async function sendReminderMail() {
  await trpc.admin.enroll.phase.sendReminderMail.mutate({ phaseId })
}

async function sendOpeningMail() {
  await trpc.admin.enroll.phase.sendOpeningMail.mutate({ phaseId })
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
                <div class="d-flex flex-column align-center ga-4">
                  <VBtn :to="`${phaseId}/edit`">Bearbeiten</VBtn>
                  <VBtn
                    v-if="phaseState.modelValue === 'OPEN'"
                    @click="sendOpeningMail"
                  >
                    <span class="white">Eröffnungsmail senden</span>
                  </VBtn>
                  <VBtn
                    v-if="phaseState.modelValue === 'OPEN'"
                    @click="sendReminderMail"
                  >
                    <span class="white">Erinnerungsmail senden</span>
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
