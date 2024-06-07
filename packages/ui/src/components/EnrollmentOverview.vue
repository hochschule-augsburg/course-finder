<script setup lang="ts">
import type { EnrollPhase } from '@workspace/api/src/prisma/PrismaTypes'

import { phaseStates } from '@/helper/enums/phaseStates'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const props = defineProps<{ phase: EnrollPhase | undefined }>()
const { locale } = useI18n()

const stateText = computed(
  () => phaseStates.find((e) => e.value === props.phase?.state)?.text,
)
</script>

<template>
  <VSheet
    v-if="phase !== undefined"
    class="px-4 py-3"
    color="secondary"
    id="enrollment-overview"
    rounded="lg"
  >
    <h2>
      {{ locale === 'de' ? phase.title.de : phase.title.en }}
    </h2>
    <p>
      {{
        `${phase.start.toLocaleDateString()} - ${phase.end.toLocaleDateString()}`
      }}
    </p>
    <p>
      {{ locale === 'de' ? phase.description.de : phase.description.en }}
    </p>
    <p>
      {{ $t(`phase-states.long.${stateText}`) }}
    </p>
  </VSheet>
</template>
