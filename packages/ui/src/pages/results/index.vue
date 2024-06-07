<script setup lang="ts">
import { useAssignStore } from '@/stores/AssignStore'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { mdiCheck, mdiClose, mdiHelp } from '@mdi/js'
import { computed, onBeforeMount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  VList,
  VListItem,
  VTab,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
} from 'vuetify/components'

const { locale } = useI18n()

// TODO alle USER-PHASES statt phases
const coursesStore = useCoursesStore()
const assignStore = useAssignStore()
const enrollStore = useEnrollmentStore()

const phaseIndex = ref(0)

const selectedModuleCode = ref<string>()
const selectedSubject = computed(() =>
  coursesStore.subjects.find((s) => s.moduleCode === selectedModuleCode.value),
)

onBeforeMount(() => {
  void assignStore.fetch()
})
</script>

<template>
  <VTabs v-model="phaseIndex" show-arrows>
    <VTab
      v-for="(phase, i) in assignStore.assignPhases"
      :key="i"
      :text="phase.Phase.title[locale]"
      :value="i"
    />
  </VTabs>

  <VTabsWindow v-model="phaseIndex">
    <VTabsWindowItem
      v-if="coursesStore.currentPhase"
      :value="coursesStore.currentPhase.id"
    >
      <EnrollmentOverview :phase="coursesStore.currentPhase" />

      <VList>
        <VListItem
          v-for="subject in enrollStore.enrolledSubjects"
          :key="subject.moduleCode"
          :prepend-icon="mdiHelp"
          :subtitle="subject.points"
          :title="subject.title[locale]"
          @click="selectedModuleCode = subject.moduleCode"
        />
      </VList>
    </VTabsWindowItem>
    <VTabsWindowItem
      v-for="(phase, i) in assignStore.assignPhases"
      :key="i"
      :value="i"
    >
      <EnrollmentOverview :phase="phase.Phase" />

      <VList v-if="phase.assignments.length | phase.lost.length">
        <VListItem
          v-for="subject in phase.assignments"
          :key="subject.moduleCode"
          :prepend-icon="mdiCheck"
          :subtitle="subject.points"
          :title="subject.Course?.title[locale] ?? subject.moduleCode"
          @click="selectedModuleCode = subject.moduleCode"
        />
        <VListItem
          v-for="subject in phase.lost"
          :key="subject.moduleCode"
          :prepend-icon="mdiClose"
          :subtitle="subject.points"
          :title="subject.Course?.title[locale] ?? subject.moduleCode"
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
