<script setup lang="ts">
import { useCoursesStore } from '@/stores/CoursesStore'
import { useI18n } from 'vue-i18n'

defineProps<{
  visible: boolean
}>()
const enrollmentStore = useCoursesStore()
const { locale } = useI18n()
</script>

<template>
  <div v-if="enrollmentStore.currentPhase && !visible" class="mx-2">
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
      <li
        v-for="s in [
          /*enrolled */
        ]"
        :key="s.moduleCode"
      >
        {{ `${locale === 'de' ? s.title?.de : s.title?.en} (${s.points})` }}
      </li>
    </div>
  </div>
</template>
