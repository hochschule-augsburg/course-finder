<script lang="ts" setup>
import { useAdminAssignStore } from '@/stores/admin/AdminAssignStore'
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VSpacer,
  VTab,
  VTable,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
} from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()
const { t } = useI18n()

const assignStore = useAdminAssignStore()

const tryNo = ref(0)

onBeforeMount(async () => {
  await assignStore.fetchAssignments(props.phaseId)
  console.log(assignStore.assignments)
})
</script>

<template>
  <div>
    <VTabs v-model="tryNo" class="position-relative">
      <VTab
        v-for="(assignment, i) in assignStore.assignments[props.phaseId]"
        :key="i"
        :value="i"
      >
        {{ t('iteration') }} {{ i }}
      </VTab>
      <VSpacer />
      <VBtn flat>{{ t('publish') }}</VBtn>
      <VBtn color="success" flat @click="assignStore.newAssignment(phaseId)">
        {{ t('new-assignment') }}
      </VBtn>
    </VTabs>

    <VTabsWindow v-model="tryNo">
      <VTabsWindowItem
        v-for="(assignment, i) in assignStore.assignments[props.phaseId]"
        :key="i"
        :value="i"
      >
        <VTable>
          <thead>
            <tr>
              <th>{{ t('module-code') }}</th>
              <th>{{ t('title') }}</th>
              <th>{{ t('count') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in assignment" :key="course.moduleCode">
              <td>{{ course.moduleCode }}</td>
              <!-- <td>{{ course.title }}</td> -->
              <td>{{ course.count }}</td>
            </tr>
          </tbody>
        </VTable>
      </VTabsWindowItem>
    </VTabsWindow>
  </div>
</template>

<i18n lang="yaml">
en:
  iteration: Iteration
  publish: Publish
  new-assignment: New Assignment
  module-code: Module Code
  title: Title
  count: Count

de:
  iteration: Iteration
  publish: Veröffentlichen
  new-assignment: Neue Aufgabe
  module-code: Modulcode
  title: Titel
  count: Anzahl
</i18n>
