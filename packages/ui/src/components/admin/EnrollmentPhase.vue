<script setup lang="ts">
import { getDateFnsLocale } from '@/helper/LocaleDateFormat'
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useIntervalFn } from '@vueuse/core'
import { formatDuration, intervalToDuration } from 'date-fns'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const adminCoursesStore = useAdminCoursesStore()

const props = defineProps<{
  phaseId?: number
}>()

const phase = computed(() => {
  const phase = adminCoursesStore.phases[props.phaseId ?? -1]
  if (phase) {
    return {
      ...phase,
      endFormatted: phase.end.toLocaleString(locale.value, {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      startFormatted: phase.start.toLocaleString(locale.value, {
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
      locale: getDateFnsLocale(locale.value),
    })
  }
}
</script>

<template>
  <div>
    <div v-if="phase" class="current-phase">
      <h3>
        {{ locale === 'en' ? phase.title.en : phase.title.de }}
      </h3>
      <strong>{{ t('start') }}:</strong>
      {{ phase.startFormatted }}
      <br />
      <strong>{{ t('end') }}:</strong>
      {{ phase.endFormatted }}
      <br />
      <template v-if="remainingTime">
        <strong>{{ t('remaining-time') }}:</strong>
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

<i18n lang="yaml">
en:
  phase: Current phase
  start: Start
  end: End
  remaining-time: Remaining Time
de:
  phase: Aktuelle Phase
  start: Start
  end: Ende
  remaining-time: Verbleibende Zeit
</i18n>
