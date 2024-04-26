<script setup lang="ts">
import { useEnrollmentStore } from '@/stores/enrollment'
import { useI18n } from 'vue-i18n'

defineProps<{
  enrollView: boolean
}>()
const enrollmentStore = useEnrollmentStore()
const { locale } = useI18n()
</script>

<template>
  <div v-if="enrollmentStore.currentPhase && !enrollView" class="mx-2">
    <h2>
      {{
        locale === 'de'
          ? enrollmentStore.currentPhase.title.de
          : enrollmentStore.currentPhase.title.en
      }}
    </h2>
    <p>
      {{
        `${enrollmentStore.currentPhase.start.toLocaleDateString()} - ${enrollmentStore.currentPhase.end.toLocaleDateString()}`
      }}
    </p>
    <p>
      {{
        locale === 'de'
          ? enrollmentStore.currentPhase.description.de
          : enrollmentStore.currentPhase.description.en
      }}
    </p>
    <div class="ml-3">
      <li v-for="s in enrollmentStore.enrolledCourses" :key="s.moduleCode">
        {{ `${locale === 'de' ? s.title?.de : s.title?.en} (${s.points})` }}
      </li>
    </div>
  </div>
</template>
