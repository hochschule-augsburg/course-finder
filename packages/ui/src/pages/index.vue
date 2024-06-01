<script setup lang="ts">
import { homeTour, useTourPool } from '@/composables/tourPool'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { mdiDotsGrid, mdiFormatListBulleted, mdiPenLock } from '@mdi/js'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { VBadge, VBtn, VBtnToggle, VIcon, VTooltip } from 'vuetify/components'

defineOptions({
  name: 'CourseEnrollmentOverview',
})

const enrollmentStore = useEnrollmentStore()
const coursesStore = useCoursesStore()

const pendingEnroll = computed(() =>
  enrollmentStore.enrolledSubjects.some((e) => !e.points),
)
const { mobile } = useDisplay()
const lastSubjectView = useLocalStorage(
  'subjectView',
  mobile.value ? 'grid' : 'list',
)
const subjectView = computed(() =>
  mobile.value ? 'grid' : lastSubjectView.value,
)
const enrollFormVisible = ref(false)

const isFirstVisit = useLocalStorage('isFirstVisit', true, {
  listenToStorageChanges: false,
})

const { startTour } = useTourPool()
watch(
  () => coursesStore.currentPhase,
  () => {
    if (homeTour && isFirstVisit.value && coursesStore.currentPhase) {
      isFirstVisit.value = false
      startTour(homeTour)
    }
  },
)
</script>

<template>
  <div class="h-100">
    <EnrollmentOverview />
    <EnrollmentForm v-model:visible="enrollFormVisible" />
    <div class="pt-1">
      <FilterSection />
      <VBtnToggle
        v-if="!mobile"
        v-model="lastSubjectView"
        class="px-3 d-flex justify-end"
        id="subject-view-toggle"
        mandatory
      >
        <VBtn :icon="mdiFormatListBulleted" text="list" value="list" />
        <VBtn :icon="mdiDotsGrid" text="grid" value="grid" />
      </VBtnToggle>
      <SubjectTiles v-if="subjectView === 'grid'" />
      <SubjectTable v-if="subjectView === 'list'" />
      <div
        v-if="enrollmentStore.enrolledSubjects.length > 0"
        class="floating"
        id="enroll-button"
      >
        <VBadge :model-value="pendingEnroll" color="primary" dot>
          <VBtn icon @click="enrollFormVisible = true">
            <VIcon :icon="mdiPenLock" />
            <VTooltip activator="parent" location="top">
              Einschreiben
            </VTooltip>
          </VBtn>
        </VBadge>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.floating {
  position: fixed;
  z-index: 1;
  bottom: var(--floating-margin);
  right: var(--floating-margin);
}
</style>
