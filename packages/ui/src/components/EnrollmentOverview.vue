<script setup lang="ts">
import { useCoursesStore } from '@/stores/CoursesStore'
import { useEnrollmentStore } from '@/stores/EnrollmentStore'
import { useI18n } from 'vue-i18n'
const enrollmentStore = useEnrollmentStore()
const coursesStore = useCoursesStore()
const { locale } = useI18n()
</script>

<template>
  <div v-if="coursesStore.currentPhase" class="mx-2">
    <h2>
      {{
        locale === 'de'
          ? coursesStore.currentPhase.title.de
          : coursesStore.currentPhase.title.en
      }}
    </h2>
    <p>
      {{
        `${coursesStore.currentPhase.start.toLocaleDateString()} - ${coursesStore.currentPhase.end.toLocaleDateString()}`
      }}
    </p>
    <p>
      {{
        locale === 'de'
          ? coursesStore.currentPhase.description.de
          : coursesStore.currentPhase.description.en
      }}
    </p>
    <div class="ml-3">
      <li v-for="s in enrollmentStore.enrolledSubjects" :key="s.moduleCode">
        {{ `${locale === 'de' ? s.title?.de : s.title?.en} (${s.points})` }}
      </li>
    </div>
  </div>
</template>
