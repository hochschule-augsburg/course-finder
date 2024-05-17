<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  VBtn,
  VCol,
  VContainer,
  VRow,
  VTab,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
} from 'vuetify/components'

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
                <VBtn :to="`phase-${phaseId}/edit`">Edit</VBtn>
              </VCol>
              <VCol cols="6">
                <VBtn>New Assignment</VBtn>
              </VCol>
            </VRow>
            <!-- <VRow>
              <VCol cols="6">
                <VBtn>Button 3</VBtn>
              </VCol>
              <VCol cols="6">
                <VBtn>Button 4</VBtn>
              </VCol>
            </VRow> -->
          </VCol>
        </VRow>
      </VContainer>
      <VDivider class="pb-4" />
      <VTabs v-model="tab" align-tabs="center">
        <VTab value="courses">Courses</VTab>
        <VTab value="assignments">Assignment</VTab>
      </VTabs>
      <VTabsWindow v-model="tab">
        <VTabsWindowItem value="courses">
          <OfferedCoursesTable :phase-id />
        </VTabsWindowItem>
        <VTabsWindowItem value="assignments">
          <OfferedCoursesTable :phase-id />
        </VTabsWindowItem>
      </VTabsWindow>
    </template>
    <template v-else>
      <h1>Phase not found</h1>
    </template>
  </div>
</template>
