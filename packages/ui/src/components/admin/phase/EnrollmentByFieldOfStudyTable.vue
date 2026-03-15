<script lang="ts" setup>
import { computed, watch } from 'vue'
import { VTable } from 'vuetify/components'

import { fieldsOfStudyAbbrMap } from '@/helper/enums/fieldsOfStudy'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'

const props = defineProps<{ phaseId: number }>()

const adminStats = useAdminStatsStore()

const enrollmentByFieldOfStudy = computed(() =>
  Object.entries(adminStats.byFieldOfStudy[props.phaseId] ?? {}).map(
    ([fieldOfStudy, stat]) => ({
      count: stat?.count ?? 0,
      fieldOfStudy,
    }),
  ),
)

watch(
  () => props.phaseId,
  () => {
    // setTimeout(() => adminStats.fetchByFieldOfStudy(props.phaseId), 1000)
    void adminStats.fetchByFieldOfStudy(props.phaseId)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <h2>Anmeldungen pro Studiengang</h2>
    <VTable density="compact" hover>
      <thead>
        <tr>
          <th>
            <strong>Studiengang</strong>
          </th>
          <th>
            <strong>Anzahl</strong>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in enrollmentByFieldOfStudy" :key="entry.fieldOfStudy">
          <td>
            {{ fieldsOfStudyAbbrMap[entry.fieldOfStudy] ?? entry.fieldOfStudy }}
          </td>
          <td>{{ entry.count }}</td>
        </tr>
      </tbody>
    </VTable>
  </div>
</template>
