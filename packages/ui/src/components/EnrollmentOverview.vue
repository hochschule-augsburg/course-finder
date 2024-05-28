<script setup lang="ts">
import { phaseStates } from '@/helper/enums/phaseStates'
import { useCoursesStore } from '@/stores/CoursesStore'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const coursesStore = useCoursesStore()
const { locale } = useI18n()

const stateText = computed(
  () =>
    phaseStates.find((e) => e.value === coursesStore.currentPhase?.state)?.text,
)
</script>

<template>
  <VSheet
    v-if="coursesStore.currentPhase"
    class="mx-2 mb-9 px-4 py-3"
    color="secondary"
    id="enrollment-overview"
    rounded="lg"
  >
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
    <p>
      {{ $t(`phase-states.long.${stateText}`) }}
    </p>
  </VSheet>
</template>
