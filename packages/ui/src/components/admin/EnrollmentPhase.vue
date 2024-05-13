<script setup lang="ts">
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
  const phase = adminCoursesStore.phases.find((e) => e.id === props.phaseId)
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
    remainingTime.value = formatDuration(duration, {
      format: ['months', 'days', 'hours', 'minutes'],
    })
  }
}
</script>

<template>
  <div>
    <div v-if="phase" class="current-phase">
      <h2>
        {{ t('phase') }}:
        {{ locale === 'en' ? phase.title.en : phase.title.de }}
      </h2>
      {{ t('start') }}:
      {{ phase.startFormatted }}
      <br />
      {{ t('end') }}:
      {{ phase.endFormatted }}
      <br />
      <template v-if="remainingTime">
        {{ t('remaining-time') }}: {{ remainingTime }}
      </template>
    </div>
  </div>
</template>

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
