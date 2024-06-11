<script setup lang="ts">
import { useAssignStore } from '@/stores/AssignStore'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { mdiCheck, mdiClose, mdiHelp } from '@mdi/js'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { definePage } from 'vue-router/auto'
import {
  VEmptyState,
  VList,
  VListItem,
  VTab,
  VTabs,
  VTabsWindow,
  VTabsWindowItem,
} from 'vuetify/components'

definePage({
  meta: {
    noBreadcrumbs: true,
  },
})

const { locale, t } = useI18n()

const coursesStore = useCoursesStore()
const assignStore = useAssignStore()
const enrollStore = useEnrollmentStore()

const phaseIndex = ref<number | undefined>(coursesStore.currentPhase?.id)
watchEffect(() => {
  if (coursesStore.currentPhase) {
    phaseIndex.value = coursesStore.currentPhase.id
  }
})

const selectedModuleCode = ref<string>()
const selectedSubject = computed(() =>
  coursesStore.subjects.find((s) => s.moduleCode === selectedModuleCode.value),
)

onBeforeMount(() => {
  void assignStore.fetch()
})
</script>

<template>
  <VTabs v-model="phaseIndex" class="mx-2 mb-6" show-arrows>
    <VTab
      v-if="coursesStore.currentPhase"
      :text="coursesStore.currentPhase.title[locale]"
      :value="coursesStore.currentPhase.id"
    />
    <VTab
      v-for="(phase, i) in assignStore.assignPhases"
      :key="i"
      :text="phase.Phase.title[locale]"
      :value="phase.phaseId"
    />
  </VTabs>

  <VTabsWindow v-model="phaseIndex" class="mx-2">
    <VTabsWindowItem
      v-if="coursesStore.currentPhase"
      :value="coursesStore.currentPhase.id"
    >
      <EnrollmentOverview :phase="coursesStore.currentPhase" class="mb-3" />

      <VList
        v-if="enrollStore.enrolledSubjects.length"
        bg-color="secondary"
        rounded="lg"
      >
        <VListItem
          v-for="subject in enrollStore.enrolledSubjects"
          :key="subject.moduleCode"
          :prepend-icon="mdiHelp"
          :subtitle="subject.points"
          :title="subject.title[locale]"
          @click="selectedModuleCode = subject.moduleCode"
        />
      </VList>

      <VEmptyState v-else :title="t('empty-state')" />
    </VTabsWindowItem>
    <VTabsWindowItem
      v-for="(phase, i) in assignStore.assignPhases"
      :key="i"
      :value="phase.phaseId"
    >
      <EnrollmentOverview :phase="phase.Phase" class="mb-3" />

      <VList
        v-if="phase.assignments.length | phase.lost.length"
        bg-color="secondary"
        rounded="lg"
      >
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

      <VEmptyState v-else :title="t('empty-state')" />
    </VTabsWindowItem>
  </VTabsWindow>

  <SubjectDialog
    :subject="selectedSubject"
    :visible="!!selectedSubject"
    @update:visible="selectedModuleCode = undefined"
  />
</template>

<i18n lang="yaml">
de:
  empty-state: Keine Anmeldungen
en:
  empty-state: No Enrollments
</i18n>
