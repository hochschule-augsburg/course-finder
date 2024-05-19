<script lang="ts" setup>
import { useAdminAssignStore } from '@/stores/admin/AdminAssignStore'
import { onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VTab,
  VTable,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
} from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()
const { locale, t } = useI18n()

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
        {{ i }}
      </VTab>
      <VBtn
        class="position-absolute right-0 mr-5"
        flat
        @click="assignStore.newAssignment(phaseId)"
      >
        new assignment
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
              <td />
              <td>{{ course.count }}</td>
            </tr>
          </tbody>
        </VTable>
      </VTabsWindowItem>
    </VTabsWindow>
  </div>
</template>
