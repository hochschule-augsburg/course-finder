<script lang="ts" setup>
import { useAdminAssignStore } from '@/stores/admin/AdminAssignStore'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useAdminStatsStore } from '@/stores/admin/AdminStatsStore'
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
const { locale, t } = useI18n()

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

async function newAssignment() {
  const newTryNo = await assignStore.newAssignment(props.phaseId)
  await nextTick()
  tryNo.value = newTryNo
}
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
      <VBtn
        v-if="assignStore.assignments[phaseId]?.length"
        class="mr-4"
        flat
        @click="publish"
      >
        {{ t('publish', [tryNo]) }}
      </VBtn>
      <VTooltip :disabled="!drawingObstacle" location="top">
        <template #activator="{ props: tipProps }">
          <div v-bind="tipProps">
            <VBtn
              :disabled="!!drawingObstacle"
              color="success"
              flat
              @click="newAssignment"
            >
              {{ t('new-assignment') }}
            </VBtn>
          </div>
        </template>
        {{ t(`obstacles.${drawingObstacle}`) }}
      </VTooltip>
    </VTabs>

    <VTabsWindow v-model="tryNo">
      <VTabsWindowItem
        v-for="(assignment, i) in assignStore.assignments[phaseId]"
        :key="i"
        :value="i"
      >
        <VTable>
          <thead>
            <tr>
              <th>{{ t('module-code') }}</th>
              <th>{{ t('title') }}</th>
              <th>{{ t('min') }}</th>
              <th>{{ t('max') }}</th>
              <th>{{ t('count') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in assignment" :key="course.moduleCode">
              <td>{{ course.moduleCode }}</td>
              <td>
                {{
                  locale === 'de'
                    ? course.Course?.Course.title.de
                    : course.Course?.Course.title.de
                }}
              </td>
              <td>{{ course.Course?.minParticipants }}</td>
              <td>{{ course.Course?.maxParticipants }}</td>
              <td>{{ course.count }}</td>
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
      {{ t('published', [tryNo]) }}
    </VSnackbar>
  </div>
</template>

<i18n lang="yaml">
en:
  iteration: Iteration
  publish: Publish iteration {0}
  new-assignment: New Assignment
  module-code: Module Code
  title: Title
  count: Assignment Count
  published: Published iteration {0}
  min: Min
  max: Max
  obstacles:
    not-in-drawing: Not in drawing state
    not-enough-students: Not enough students

de:
  iteration: Iteration
  publish: Iteration {0} veröffentlichen
  new-assignment: Neue Auslosung
  module-code: Modulcode
  title: Titel
  count: Anzahl Auslosungen
  min: Min
  max: Max
  published: Iteration {0} Veröffentlicht
  obstacles:
    not-in-drawing: Nicht im Auslosungsstatus
    not-enough-students: Nicht genügend Studierende
</i18n>
