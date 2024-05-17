<script lang="ts" setup>
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { computed } from 'vue'
import { VBtn, VContainer, VRow } from 'vuetify/components'

const adminCoursesStore = useAdminCoursesStore()

const passedPhases = computed(() => {
  return adminCoursesStore.phases.filter((phase) => phase.end < new Date())
})
</script>

<template>
  <div class="mx-10">
    <h1>Passed Phases</h1>
    <VContainer>
      <VRow justify="center">
        <VCol v-for="subject in passedPhases" :key="subject.id" cols="auto">
          <VBtn
            :to="`/admin/phase-${subject.id}`"
            height="150"
            style="text-align: left; text-transform: none; font-weight: normal"
            width="350"
          >
            <EnrollmentPhase :phase-id="subject.id" />
          </VBtn>
        </VCol>
      </VRow>
    </VContainer>
  </div>
</template>
