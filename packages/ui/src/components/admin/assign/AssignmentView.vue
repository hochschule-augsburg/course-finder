<script lang="ts" setup>
import { useAdminAssignStore } from '@/stores/admin/AdminAssignStore'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
import { trpc } from '@/trpc'
import { mdiDownload } from '@mdi/js'
import { saveAs } from 'file-saver'
import { computed, nextTick, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VBtn,
  VSnackbar,
  VSpacer,
  VTab,
  VTable,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
  VTooltip,
} from 'vuetify/components'

const props = defineProps<{ phaseId: number }>()
const { locale } = useI18n()

const assignStore = useAdminAssignStore()
const coursesStore = useAdminCoursesStore()
const statsStore = useAdminStatsStore()

const drawingObstacle = computed(() => {
  if (coursesStore.phases[props.phaseId]?.state !== 'DRAWING') {
    return 'not-in-drawing'
  }
  if (!statsStore.phase[props.phaseId]?.studentCount) {
    return 'not-enough-students'
  }
  return ''
})

const tryNo = ref(0)
const publishing = ref(false)
const published = ref(false)

onBeforeMount(async () => {
  await Promise.all([
    assignStore.fetchAssignments(props.phaseId),
    coursesStore.fetchOfferedCourses(props.phaseId),
  ])
  tryNo.value = (assignStore.assignments[props.phaseId]?.length || 1) - 1
  void statsStore.fetchPhase(props.phaseId)
})

async function publish() {
  publishing.value = true
  try {
    await assignStore.publish(props.phaseId, tryNo.value)
    published.value = true
  } catch (e) {
    console.error(e)
  } finally {
    publishing.value = false
  }
}

async function download() {
  const yaml = await trpc.admin.assign.yaml.query({
    phaseId: props.phaseId,
    tryNo: tryNo.value,
  })
  const phase = coursesStore.phases[props.phaseId]
  saveAs(
    new Blob([yaml], { type: 'text/yaml' }),
    `results-${phase.title.de}-${tryNo.value}.yml`,
  )
}

async function newAssignment() {
  const newTryNo = await assignStore.newAssignment(props.phaseId)
  await nextTick()
  tryNo.value = newTryNo
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between">
      <VTabs v-model="tryNo" class="position-relative">
        <VTab
          v-for="(assignment, i) in assignStore.assignments[props.phaseId]"
          :key="i"
          :value="i"
        >
          Iteration {{ i }}
        </VTab>
        <VSpacer />
      </VTabs>
      <div class="d-flex ga-2">
        <VTooltip location="top">
          <template #activator="{ props: tipProps }">
            <VBtn
              v-bind="tipProps"
              v-if="assignStore.assignments[phaseId]?.length"
              flat
              @click="publish"
            >
              Iteration {{ tryNo }} veröffentlichen
            </VBtn>
          </template>
          Sendet Mails an Studenten und Verteiler <br />
          und zeigt die Auslosung Studenten
        </VTooltip>
        <VTooltip location="top">
          <template #activator="{ props: tipProps }">
            <VBtn v-bind="tipProps" flat @click="download">
              <VIcon :icon="mdiDownload" />
            </VBtn>
          </template>
          Download results.yml
        </VTooltip>
        <VTooltip :disabled="!drawingObstacle" location="top">
          <template #activator="{ props: tipProps }">
            <div v-bind="tipProps">
              <VBtn
                :disabled="!!drawingObstacle"
                color="success"
                flat
                @click="newAssignment"
              >
                Neue Auslosung
              </VBtn>
            </div>
          </template>
          {{
            drawingObstacle === 'not-in-drawing'
              ? 'Nicht im Auslosungsstatus'
              : 'Nicht genügend Studierende'
          }}
        </VTooltip>
      </div>
    </div>

    <VTabsWindow v-model="tryNo" class="mt-1">
      <span v-if="!assignStore.assignments[phaseId]?.length">
        Keine Daten
      </span>
      <VTabsWindowItem
        v-else
        v-for="(assignment, i) in assignStore.assignments[phaseId]"
        :key="i"
        :value="i"
      >
        <VTable>
          <thead>
            <tr>
              <th>Modulcode</th>
              <th>Titel</th>
              <th>Min</th>
              <th>Max</th>
              <th>Anzahl Auslosungen</th>
              <th>Anzahl Studierende</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="course in assignment"
              :class="{ 'bg-red-lighten-4': !course.assignCount }"
              :key="course.moduleCode"
            >
              <td>{{ course.moduleCode }}</td>
              <td>
                {{ course.Course?.Course.title[locale] }}
              </td>
              <td>{{ course.Course?.minParticipants }}</td>
              <td>{{ course.Course?.maxParticipants }}</td>
              <td>{{ course.assignCount }}</td>
              <td>{{ course.studentCount }}</td>
            </tr>
          </tbody>
        </VTable>
      </VTabsWindowItem>
    </VTabsWindow>
    <VSnackbar
      v-model="published"
      :timeout="1000"
      color="secondary"
      location="bottom left"
      rounded="pill"
    >
      Iteration {{ tryNo }} veröffentlicht
    </VSnackbar>
  </div>
</template>
