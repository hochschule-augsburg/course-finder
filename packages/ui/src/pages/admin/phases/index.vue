<script lang="ts" setup>
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useI18n } from 'vue-i18n'
import { VCard, VCardText, VCol, VContainer, VRow } from 'vuetify/components'

const { t } = useI18n()

const adminCoursesStore = useAdminCoursesStore()
</script>

<template>
  <div class="mx-10">
    <h1>{{ t('enrollment-phases') }}</h1>
    <VContainer>
      <VRow justify="center">
        <VCol
          v-for="phase in adminCoursesStore.phases"
          :key="phase.id"
          cols="auto"
        >
          <VCard
            :to="`phases/${phase.id}`"
            density="compact"
            height="150"
            width="350"
          >
            <VCardText>
              <EnrollmentPhase :phase-id="phase.id" class="pa-4" />
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>

<i18n lang="yaml">
en:
  enrollment-phases: Enrollment Phases
de:
  enrollment-phases: Anmeldephasen
</i18n>
