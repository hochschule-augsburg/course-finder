<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { mdiDotsGrid, mdiFormatListBulleted, mdiPenLock } from '@mdi/js'
import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { VBadge, VBtn, VBtnToggle, VIcon, VTooltip } from 'vuetify/components'

defineOptions({
  name: 'CourseEnrollmentOverview',
})

const enrollmentStore = useEnrollmentStore()

const pendingEnroll = computed(() =>
  enrollmentStore.enrolledSubjects.some((e) => !e.points),
)
const { mobile } = useDisplay()
const subjectView = mobile.value
  ? 'grid'
  : useLocalStorage('subjectView', mobile.value ? 'grid' : 'list')
const enrollFormVisible = ref(false)
</script>

<template>
  <div class="h-100">
    <EnrollmentOverview />
    <EnrollmentForm v-model:visible="enrollFormVisible" />
    <div class="pt-1">
      <FilterSection />
      <VBtnToggle
        v-model="subjectView"
        :disabled="mobile"
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
