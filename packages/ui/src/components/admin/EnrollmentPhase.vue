<script setup lang="ts">
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useIntervalFn } from '@vueuse/core'
import { formatDuration, intervalToDuration, isWithinInterval } from 'date-fns'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale, t } = useI18n()
const adminCoursesStore = useAdminCoursesStore()
const phase = computed(() => {
  const phase = adminCoursesStore.phases.find((e) =>
    isWithinInterval(new Date(), {
      end: new Date(e.end),
      start: new Date(e.start),
    }),
  )
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
    const duration = intervalToDuration({
      end: new Date(phase.value.end),
      start: new Date(),
    })
    remainingTime.value = formatDuration(duration, {
      format: ['months', 'days', 'hours', 'minutes'],
    })
  }
}
</script>

<template>
  <div>
    <h1>{{ t('title') }}</h1>
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
  title: Administration
  phase: Current phase
  start: Start
  end: End
  remaining-time: Remaining Time
de:
  title: Verwaltung
  phase: Aktuelle Phase
  start: Start
  end: Ende
  remaining-time: Verbleibende Zeit
</i18n>
