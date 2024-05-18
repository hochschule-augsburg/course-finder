<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { VBtn, VCol, VContainer, VRow } from 'vuetify/components'

const route = useRoute()
const phaseId = Number(route.params.phaseId)

const tab = ref<'assignments' | 'courses'>('courses')
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
                <VBtn :to="`${phaseId}/edit`">Edit</VBtn>
              </VCol>
              <VCol cols="6">
                <VBtn>New Assignment</VBtn>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VBtn>Close</VBtn>
              </VCol>
              <!-- <VCol cols="6">
                <VBtn>Button 4</VBtn>
              </VCol> -->
            </VRow>
          </VCol>
        </VRow>
      </VContainer>
    </template>
    <template v-else>
      <h1>Phase not found</h1>
    </template>
  </div>
</template>
