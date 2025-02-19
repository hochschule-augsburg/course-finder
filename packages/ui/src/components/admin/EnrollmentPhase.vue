<script setup lang="ts">
import { getDateFnsLocale } from '@/helper/LocaleDateFormat'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useIntervalFn } from '@vueuse/core'
import { formatDuration, intervalToDuration } from 'date-fns'
import { computed, ref, watch } from 'vue'

const adminCoursesStore = useAdminCoursesStore()

const props = defineProps<{
  phaseId?: number
}>()

const phase = computed(() => {
  const phase = adminCoursesStore.phases[props.phaseId ?? -1]
  if (phase) {
    return {
      ...phase,
      endFormatted: phase.end.toLocaleString('de', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      startFormatted: phase.start.toLocaleString('de', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
    }
  }
  return undefined
})

const remainingTime = ref<string>()

watch(phase, updateRemainingTime, { immediate: true })

useIntervalFn(updateRemainingTime, 10000)

function updateRemainingTime() {
  if (phase.value) {
    const now = new Date()
    if (phase.value.end.getTime() < now.getTime()) {
      remainingTime.value = undefined
      return
    }
    const duration = intervalToDuration({
      end: new Date(phase.value.end),
      start: now,
    })
    // date-fns does not do weeks here
    duration.weeks = Math.floor((duration.days ?? 0) / 7)
    duration.days = (duration.days ?? 0) % 7
    remainingTime.value = formatDuration(duration, {
      format: ['months', 'weeks', 'days', 'hours', 'minutes'],
      locale: getDateFnsLocale('de'),
    })
  }
}
</script>

<template>
  <div>
    <div v-if="phase" class="current-phase">
      <h3>
        {{ phase.title.de }}
      </h3>
      <strong>Start:</strong>
      {{ phase.startFormatted }}
      <br />
      <strong>Ende:</strong>
      {{ phase.endFormatted }}
      <br />
      <template v-if="remainingTime">
        <strong>Verbleibende Zeit:</strong>
        {{ remainingTime }}
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.current-phase {
  hyphens: auto;
  white-space: wrap;
}
</style>
