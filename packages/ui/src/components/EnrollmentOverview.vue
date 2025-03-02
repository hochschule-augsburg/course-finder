<script setup lang="ts">
import type { EnrollPhase } from '@workspace/api/src/prisma/PrismaTypes'

import { phaseStates } from '@/helper/enums/phaseStates'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { VSheet } from 'vuetify/components'

const props = defineProps<{ phase: EnrollPhase | null | undefined }>()
const { locale } = useI18n()

const stateText = computed(
  () => phaseStates.find((e) => e.value === props.phase?.state)?.text,
)
</script>

<template>
  <VSheet
    v-if="phase"
    class="sheet px-4 py-3"
    color="secondary"
    id="enrollment-overview"
    rounded="lg"
  >
    <h2>
      {{ phase.title[locale] }}
    </h2>
    <p>
      {{
        `${phase.start.toLocaleDateString(locale)} - ${phase.end.toLocaleDateString(locale)}`
      }}
    </p>
    <p>
      {{ phase.description[locale] }}
    </p>
    <p>
      {{ $t(`phase-states.long.${stateText}`) }}
    </p>
  </VSheet>
</template>

<style lang="scss" scoped>
.sheet {
  cursor: pointer;
}
</style>
