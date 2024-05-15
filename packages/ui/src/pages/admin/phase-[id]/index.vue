<script lang="ts" setup>
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import { VBtn, VCol, VRow } from 'vuetify/components'

const route = useRoute()
const phaseId = Number(route.params.id)

const adminCoursesStore = useAdminCoursesStore()
onBeforeMount(() => {
  void adminCoursesStore.fetchOfferedCourses(phaseId)
})
/* eslint-disable vue/no-multiple-template-root */
</script>

<template>
  <div class="mx-10">
    <template v-if="phaseId">
      <VContainer>
        <VRow>
          <VCol>
            <EnrollmentPhase :phase-id class="pb-4" />
          </VCol>
          <VCol>
            <VRow>
              <VCol>
                <VBtn :to="`phase-${phaseId}/edit`">edit</VBtn>
              </VCol>
            </VRow>
            <VRow>
              <VCol>
                <VBtn>Assign</VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VContainer>
      <VDivider class="pb-4" />
      <OfferedCoursesTable :phase-id />
    </template>
    <template v-else>
      <h1>Phase not found</h1>
    </template>
  </div>
</template>
