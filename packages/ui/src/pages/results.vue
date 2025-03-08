<script setup lang="ts">
import { useAssignStore } from '@/stores/AssignStore'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { mdiCheck, mdiClose, mdiHelp } from '@mdi/js'
import { watch } from 'vue'
import { computed, ref, watchEffect } from 'vue'
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
  } else {
    phaseIndex.value = assignStore.assignPhases.at(-1)?.phaseId
  }
})

const selectedModuleCode = ref<string>()
const selectedSubject = computed(() =>
  coursesStore.subjects.find((s) => s.moduleCode === selectedModuleCode.value),
)

const noData = ref<boolean>()
watch(
  () => [coursesStore.currentPhase, assignStore.assignPhases],
  () => {
    if (!coursesStore.currentPhase && !assignStore.assignPhases.length) {
      setTimeout(() => {
        noData.value =
          !coursesStore.currentPhase && !assignStore.assignPhases.length
      }, 50)
    }
  },
  { immediate: true },
)
</script>

<template>
  <VSheet v-if="noData" class="px-4 py-3" color="secondary" rounded="lg">
    {{ t('no-data') }}
  </VSheet>
  <VTabs v-model="phaseIndex" class="mx-2 mb-6" show-arrows>
    <VTab
      v-if="coursesStore.currentPhase"
      :text="coursesStore.currentPhase.title[locale]"
      :value="coursesStore.currentPhase.id"
    />
    <template v-for="(phase, i) in assignStore.assignPhases" :key="i">
      <VTab
        v-if="phase.phaseId !== coursesStore.currentPhase?.id"
        :text="phase.Phase.title[locale]"
        :value="phase.phaseId"
      />
    </template>
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
    <template v-for="(phase, i) in assignStore.assignPhases" :key="i">
      <VTabsWindowItem
        v-if="phase.phaseId !== coursesStore.currentPhase?.id"
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
    </template>
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
  no-data: Keine Daten. Noch hast du an keiner Anmeldung teilgenommen.
en:
  empty-state: No Enrollments
  no-data: No data. You have not participated in any enrollment yet.
</i18n>
