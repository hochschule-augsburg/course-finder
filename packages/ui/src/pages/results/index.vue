<script setup lang="ts">
import { useCoursesStore } from '@/stores/CoursesStore'
import { mdiCheck, mdiClose, mdiHelp } from '@mdi/js'
import { computed, ref } from 'vue'
import {
  VList,
  VListItem,
  VTab,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
} from 'vuetify/components'

const phaseIndex = ref(0)

// TODO alle USER-PHASES statt phases
const coursesStore = useCoursesStore()
const phases = computed(() => [
  {
    ...coursesStore.currentPhase,
    subjects: coursesStore.subjects.slice(0, 3).map((s) => ({
      enrolled: undefined,
      points: (Math.random() * 100).toFixed(0),
      ...s,
    })),
    title: { de: 'Anmeldung SS24', en: 'Anmeldung SS24' },
  },
  {
    ...coursesStore.currentPhase,
    subjects: coursesStore.subjects.slice(0, 4).map((s) => ({
      enrolled: s.title.de?.startsWith('A') ? true : false,
      points: (Math.random() * 100).toFixed(0),
      ...s,
    })),
    title: { de: 'Anmeldung WS23/24', en: 'Anmeldung WS23/24' },
  },
  {
    ...coursesStore.currentPhase,

    subjects: coursesStore.subjects.slice(0, 5).map((s) => ({
      enrolled: s.title.de?.startsWith('A') ? true : false,
      points: (Math.random() * 100).toFixed(0),
      ...s,
    })),
    title: { de: 'Anmeldung SS23', en: 'Anmeldung SS23' },
  },
  {
    ...coursesStore.currentPhase,
    subjects: coursesStore.subjects.slice(0, 6).map((s) => ({
      enrolled: s.title.de?.startsWith('A') ? true : false,
      points: (Math.random() * 100).toFixed(0),
      ...s,
    })),
    title: { de: 'Anmeldung WS22/23', en: 'Anmeldung WS22/23' },
  },
])

const selectedModuleCode = ref<string>()
const selectedSubject = computed(() =>
  coursesStore.subjects.find((s) => s.moduleCode === selectedModuleCode.value),
)
</script>

<template>
  <VTabs v-model="phaseIndex" show-arrows>
    <VTab
      v-for="(phase, i) in phases"
      :key="i"
      :text="phase.title.de"
      :value="i"
    />
  </VTabs>

  <VTabsWindow v-model="phaseIndex">
    <VTabsWindowItem v-for="(phase, i) in phases" :key="i" :value="i">
      <!-- update phase type in EnrollmentOverview -->
      <!-- <EnrollmentOverview v-if="phase" :phase="phase" /> -->
      <EnrollmentOverview v-if="phase" :phase="coursesStore.currentPhase" />

      <VList v-if="phase.subjects.length">
        <VListItem
          v-for="subject in phases[phaseIndex].subjects"
          :prepend-icon="
            subject.enrolled === undefined
              ? mdiHelp
              : subject.enrolled
                ? mdiCheck
                : mdiClose
          "
          :key="subject.moduleCode"
          :subtitle="subject.points"
          :title="subject.title.de"
          @click="selectedModuleCode = subject.moduleCode"
        />
      </VList>
    </VTabsWindowItem>
  </VTabsWindow>

  <SubjectDialog
    :subject="selectedSubject"
    :visible="!!selectedSubject"
    @update:visible="selectedModuleCode = undefined"
  />
</template>
