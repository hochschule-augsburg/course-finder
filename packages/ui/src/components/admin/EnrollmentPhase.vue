<script setup lang="ts">
import { useAdminCoursesStore } from '@/stores/admin/AdminCoursesStore'
import { useIntervalFn } from '@vueuse/core'
import { formatDuration, intervalToDuration, isWithinInterval } from 'date-fns'
import { computed, ref } from 'vue'
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

useIntervalFn(
  () => {
    const currentDT = new Date()
    const endDT = phase.value?.end
    if (!endDT) {
      return
    }

    //TODO check if locale is used
    remainingTime.value = formatDuration(
      intervalToDuration({ end: endDT, start: currentDT }),
      { format: ['months', 'weeks', 'days', 'hours', 'minutes'], zero: true },
    )
  },
  2000,
  { immediate: true },
)
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
