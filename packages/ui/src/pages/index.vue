<script setup lang="ts">
import { useAssignStore } from '@/stores/AssignStore'
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { homeTour, useTourStore } from '@/stores/TourStore'
import { useUserStore } from '@/stores/UserStore'
import { mdiDotsGrid, mdiFormatListBulleted, mdiPenLock } from '@mdi/js'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { VBadge, VBtn, VBtnToggle, VIcon, VTooltip } from 'vuetify/components'

defineOptions({
  name: 'CourseEnrollmentOverview',
})

const router = useRouter()
const { t } = useI18n()

const enrollmentStore = useEnrollmentStore()
const coursesStore = useCoursesStore()
const userStore = useUserStore()
const assignStore = useAssignStore()

const pendingEnroll = computed(() =>
  enrollmentStore.enrolledSubjects.some((e) => !e.points),
)
const { mobile } = useDisplay()
const lastSubjectView = useLocalStorage('subjectView', 'grid')
const subjectView = computed(() =>
  mobile.value ? 'grid' : lastSubjectView.value,
)
const enrollFormVisible = ref(false)

const isFirstVisit = useLocalStorage('isFirstVisit', true, {
  listenToStorageChanges: false,
})

const { startTour } = useTourStore()
watch(
  () => coursesStore.currentPhase,
  () => {
    if (isFirstVisit.value && coursesStore.currentPhase) {
      isFirstVisit.value = false
      startTour(homeTour)
    }
  },
)
const overviewPhase = computed(
  () => coursesStore.currentPhase || assignStore.assignPhases.at(-1)?.Phase,
)
</script>

<template>
  <div class="h-100">
    <WelcomeBox class="mx-2 mb-6" />
    <EnrollmentOverview
      v-if="overviewPhase"
      :phase="overviewPhase"
      class="mx-2 mb-9 clickable"
      @click="router.push('/results')"
    />
    <EnrollmentForm v-model:visible="enrollFormVisible" />
    <div class="pt-1 mx-5">
      <FilterSection />
      <div class="mt-5">
        <h2 v-if="coursesStore.currentPhase">
          {{ t('your-courses-for', [userStore.user?.Student?.fieldOfStudy]) }}
        </h2>
        <template v-else>
          <h2>{{ t('courses-from-module-book') }}</h2>
          <span class="text-subtitle-1">{{ t('not-all-offered-each') }}</span>
        </template>
      </div>
      <VBtnToggle
        v-if="!mobile"
        id="subject-view-toggle"
        v-model="lastSubjectView"
        class="px-3 d-flex justify-end"
        mandatory
      >
        <VBtn
          :aria-label="t('table-view')"
          :icon="mdiFormatListBulleted"
          text="list"
          value="list"
        />
        <VBtn
          :aria-label="t('tile-view')"
          :icon="mdiDotsGrid"
          text="grid"
          value="grid"
        />
      </VBtnToggle>
      <SubjectTiles v-if="subjectView === 'grid'" />
      <SubjectTable v-if="subjectView === 'list'" />
      <div
        v-if="enrollmentStore.enrolledSubjects.length > 0"
        id="enroll-button"
        class="floating"
      >
        <VBadge
          :content="`${enrollmentStore.creditsNeeded}CP`"
          location="top start"
        >
          <VBadge :model-value="pendingEnroll" color="primary" dot>
            <VBtn icon @click="enrollFormVisible = true">
              <VIcon :icon="mdiPenLock" />
              <VTooltip activator="parent" location="top">
                {{ t('enroll') }}
              </VTooltip>
            </VBtn>
          </VBadge>
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

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
</style>

<i18n lang="yaml">
en:
  your-courses-for: Your courses for {0}
  courses-from-module-book: Courses from the current module books
  not-all-offered-each: Not all courses are offered each semester.
  enroll: Enroll
  table-view: Use table view
  tile-view: Use tile view
de:
  your-courses-for: Deine Kurse für {0}
  courses-from-module-book: Kurse aus den aktuellen Modulhandbüchern
  not-all-offered-each: Nicht alle Kurse werden in jedem Semester angeboten.
  enroll: Einschreiben
  table-view: Benutze Tabellenansicht
  tile-view: Benutze Kästchenansicht
</i18n>
